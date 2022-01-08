import { useContext, useEffect, useReducer } from "react";
import { PluginContext, WrappedWebsocket } from "../../pluginBridge";
import { Translate } from "./translate";
import { serverToRealTime } from "./utils";

const LZString = require('lz-string');

const getToken = async (tid, port) => {
  const response = await port.fetch(`https://livetiming.getraceresults.com/lt/negotiate?clientProtocol=1.5&_tk=${tid}`);
  const respJson = JSON.parse(response);
  return respJson.ConnectionToken;
};

const getWebsocketUrl = (tid, token) => `wss://livetiming.getraceresults.com/lt/connect?transport=webSockets&clientProtocol=1.5&_tk=${tid}&_gr=w&connectionToken=${encodeURIComponent(token)}&tid=8`;

const createInitialState = () => ({
  cars: {},
  columns: [],
  messages: [],
  meta: {},
  session: {},
  times: {},
  timeOffset: null,
  weather: {}
});

const messageHandler = (state, action) => {
  const [type, message] = action;
  let nextState;

  switch (type) {
    case '_':
      const submessages =  JSON.parse(LZString.decompressFromUTF16(message));
      nextState = { ...state };
      submessages.forEach(
        sm => {
          nextState = messageHandler(nextState, sm);
        }
      );
      return nextState;

    case 'r_i':
      nextState = { ...state };
      if (typeof(message.r) !== 'undefined') {
        nextState = messageHandler(state, ['r_c', message.r]);
      }
      if (typeof(message.l) !== 'undefined') {
        nextState = messageHandler(nextState, ['r_l', message.l]);
      }
      return nextState;

    case 'r_c':
      const nextCarState = { ...state['cars'] };

      message.forEach(
        ([row, col, value, ...rest]) => {
          if (row >= 0) {
            if (!nextCarState[row]) {
              nextCarState[row] = {};
            }
            if (rest.length > 0) {
              nextCarState[row][col] = [value, ...rest];
            }
            else {
              nextCarState[row][col] = value;
            }
          }
        }
      );

      return {
        ...state,
        cars: nextCarState
      };

    case 'r_l':
      return {
        ...state,
        columns: message.h || []
      };

    case 'h_i':
    case 'h_h':
      nextState = { ...state };
      if (typeof(message.f) !== 'undefined') {
        nextState['session'] = {
          ...nextState['session'],
          flag: message.f
        };
      }

      if (typeof(message.ll) !== 'undefined') {
        nextState['session'] = {
          ...nextState['session'],
          lapsCompleted: parseInt(message.ll, 10)
        };
      }

      ['q', 'r', 's', 'e', 'lt', 'lg'].forEach(
        time => {
          if (typeof(message[time]) !== 'undefined') {
            nextState['times'] = {
              ...nextState['times'],
              [time]: parseInt(message[time], 10)
            };
          }
        }
      );

      if (typeof(message.h) !== 'undefined') {
        nextState['times'] = {
          ...nextState['times'],
          h: message.h
        };
      }

      if (typeof(message.n) !== 'undefined') {
        nextState['session'] = {
          ...nextState['session'],
          name: message.n
        };
      }

      return nextState;

    case 's_t':
      return {
        ...state,
        timeOffset: serverToRealTime(message) - (Date.now() / 1000)
      };

    case 'g_weatherDataCurrent':
      return {
        ...state,
        weather: {
          ...state.weather,
          ...message
        }
      };

    case 'm_i':
      return message.reduce(
        (prevState, nextMessage) => messageHandler(prevState, ['m_c', nextMessage]),
        state
      );

    case 'm_c':
      return {
        ...state,
        messages: [
          message,
          ...state.messages
        ]
      };

    case 'm_d':
      return {
        ...state,
        messages: state.messages.filter(m => m.Id !== message)
      };

    case 't_p':
    case 'a_i':
    case 'a_u':
    case 'a_r':
    case 't_c':
    case 't_i':
    case 't_o':
    case 't_q':
      // We ignore these messages.
      return state;

    case '_update_meta':
      return {
        ...state,
        meta: message
      };

    default:
      console.warn(`No handler in place for event type ${type}`, message); // eslint-disable-line no-console
      return state;
  }

};

const extractMetadataFromIndex = (name, html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const targetURL = `https://livetiming.getraceresults.com/${name}`;

  const targetButton = doc.querySelector(`td a[href="${targetURL}"]`);
  if (targetButton) {
    const targetRow = targetButton.parentElement.parentElement;
    const tds = targetRow.getElementsByTagName('td');
    return {
      name: tds[0].textContent.trim(),
      circuit: tds[2].textContent.trim()
    };
  }


  return {};
};

export const Session = ({ serviceData }) => {

  const port = useContext(PluginContext);

  const [state, dispatch] = useReducer(messageHandler, null, createInitialState);

  useEffect(
    () => {

      port.fetch(`https://getraceresults.com/`).then(
        html => {
          dispatch(['_update_meta', extractMetadataFromIndex(serviceData.n, html)]);
        }
      );

      let ws;

      getToken(serviceData.tid, port).then(
        token => {
          const wsUrl = getWebsocketUrl(serviceData.tid, token);

          const ws = new WrappedWebsocket(wsUrl, port);

          ws.onmessage = (msg) => {
            try {
              const payload = JSON.parse(msg);
              if (payload.M) {
                payload.M.forEach(dispatch);
              }
            }
            catch {

            }
          };
        }
      );

      return () => {
        ws && ws.close();
      };
    },
    [port, serviceData]
  );

  return (
    <Translate state={state} />
  );
};
