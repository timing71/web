import { onPatch } from 'mobx-state-tree';

import { Creventic } from "./creventic";
import { Service } from "../service";
import { translate } from './translate';
import { serverToRealTime } from "./utils";

const LZString = require('lz-string');

const TID_REGEX = /(?:new liveTiming.LiveTimingApp\()(?<service_data>[^;]+)\);/;

const getToken = async (tid, port) => {
  const response = await port.fetch(`https://livetiming.getraceresults.com/lt/negotiate?clientProtocol=1.5&_tk=${tid}`);
  const respJson = JSON.parse(response);
  return respJson.ConnectionToken;
};

const getWebsocketUrl = (tid, token) => `wss://livetiming.getraceresults.com/lt/connect?transport=webSockets&clientProtocol=1.5&_tk=${tid}&_gr=w&connectionToken=${encodeURIComponent(token)}&tid=8`;

const getServiceData = async (source, port) => {
  const page = await port.fetch(source);
  const match = page.match(TID_REGEX);

  return JSON.parse(match?.groups?.service_data || 'null');

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

const createInitialState = (serviceData) => ({
  cars: {},
  columns: [],
  messages: [],
  meta: {},
  prevMessageIDs: [],
  penaltyUpdates: [],
  serviceData,
  session: {},
  times: {},
  timeOffset: null,
  weather: {}
});

const createMessageHandler = (creventic) => {
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

      case 'c_pi':
        if (message.length > 0) {
          creventic.setPenalties(message);
        }
        else {
          creventic.clearPenalties();
        }
        return state;

      case 'c_pu':
        const extant = creventic.penalties.get(message.did);
        if (extant) {
          extant.update(message);
        }
        else {
          creventic.addPenalty(message);
        }
        return state;

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

  return messageHandler;
};

export class TimeService extends Service {

  constructor(onStateChange, onManifestChange, service) {
    super(onStateChange, onManifestChange, service);

    this._creventic = Creventic.create();
    this._reducer = createMessageHandler(this._creventic);

    onPatch(
      this._creventic.penalties,
      ({ op, path }) => {
        const decisionID = parseInt(path.substring(1), 10);
        if ((op === 'add' || op === 'replace')) {
          const penalty = this._creventic.penalties.get(decisionID);
          if (!this._state.penaltyUpdates.includes(penalty)) {
            this._state.penaltyUpdates.unshift(penalty);
          }
        }
      }
    );

    this._dispatch = this._dispatch.bind(this);
    this._handleUpdate = this._handleUpdate.bind(this);

    this._state = {};
    this._ws = null;
  }

  _dispatch(message) {
    this._state = this._reducer(
      this._state,
      message
    );
    this._handleUpdate();
  }

  _handleUpdate() {
    const { manifest, state } = translate(this._state);
    this.onManifestChange(manifest);
    this.onStateChange(state);

    this._state.prevMessageIDs = this._state.messages.map(m => m.Id);
    this._state.penaltyUpdates = [];
  }

  start(port) {
    getServiceData(this.service.source, port).then(
      (serviceData) => {

        this._state = createInitialState(serviceData);

        port.fetch(`https://getraceresults.com/`).then(
          html => {
            this._dispatch(['_update_meta', extractMetadataFromIndex(serviceData.n, html)]);
          }
        ).catch(
          e => {
            console.warn('Unable to get extra metadata from getraceresults.com', e); // eslint-disable-line no-console
          }
        );

        getToken(serviceData.tid, port).then(
          token => {
            const wsUrl = getWebsocketUrl(serviceData.tid, token);

            this._ws = port.createWebsocket(wsUrl, { tag: this.service.uuid });

            this._ws.onmessage = (msg) => {
              try {
                const payload = JSON.parse(msg.data);
                if (payload.M) {
                  payload.M.forEach(this._dispatch);
                }
              }
              catch {

              }
            };
          }
        );
      }
    );
  }

  stop() {
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }
}

/*
export const Service = ({ service }) => {

  const port = useContext(PluginContext);
  const [serviceData, setServiceData] = useState(null);

  useEffect(
    () => {
      getServiceData(service.source, port).then(setServiceData);
    },
    [port, service]
  );

  return serviceData && <Session serviceData={serviceData} />;
};

*/
TimeService.regex = /livetiming\.getraceresults\.com\/[0-9a-zA-Z]+/;
