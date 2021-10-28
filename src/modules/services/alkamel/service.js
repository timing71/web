import { useContext, useEffect, useReducer, useRef } from "react";
import simpleDDP from "simpleddp";

import { PluginContext, WrappedWebsocket } from "../../pluginBridge";
import { dispatchAdded, dispatchChanged, dispatchRemoved } from "./ddp";
import { Session } from "./session";

const stateReducer = (state, action) => {
  const [name, collection] = action;
  return {
    ...state,
    [name]: [...collection],
    lastUpdate: [Date.now()]
  };
};

const MONITORED_COLLECTIONS = [
  'best_results',
  'race_control',
  'sessionBestResultsByClass',
  'sessions',
  'session_info',
  'session_entry',
  'session_status',
  'standings',
  'track_info',
  'weather'
];

const randomString = (length) => ([...Array(length)].map(() =>(~~(Math.random()*36)).toString(36)).join(''));
const randomNum = (length) => ([...Array(length)].map(() =>(~~(Math.random()*10)).toString(10)).join(''));

export const Service = ({ service }) => {
  const port = useContext(PluginContext);
  const [collections, dispatch] = useReducer(stateReducer, {});

  const feed = service.source.slice(service.source.lastIndexOf('/') + 1);

  const ddp = useRef();

  useEffect(
    () => {

      class AlkamelSocket extends WrappedWebsocket {

        constructor(url) {
          super(url, port, service.uuid);
        }

        onReceivedMessage(msg) {

          const mungedData = msg.data.slice(2, -1);

          const mungedMessage = {
            ...msg,
            data: mungedData.length > 0 ? JSON.parse(mungedData) : null
          };

          this.emit('message', mungedMessage);
          if (this.onmessage) {
            this.onmessage(mungedMessage);
          }
        }

        send(data) {
          super.send(JSON.stringify([data]));
        }
      }

      const server = new simpleDDP({
        endpoint: `wss://livetiming.alkamelsystems.com/sockjs/${randomNum(3)}/${randomString(8)}/websocket`,
        SocketConstructor: AlkamelSocket
      });
      // Evil monkeypatch:
      server.dispatchAdded = dispatchAdded;
      server.dispatchChanged = dispatchChanged;
      server.dispatchRemoved = dispatchRemoved;

      ddp.current = server;

      MONITORED_COLLECTIONS.forEach(
        c => server.collection(c).reactive().onChange(
          s => dispatch([c, s])
        )
      );

      server.on('added', ({ collection, fields }) => {
        // We make the assumption here that we'll only ever get the single "feed"
        // we're after!
        if (collection === 'feeds') {
          server.sub('sessions', [fields.sessions || []]);
          server.sub('sessionInfo', [fields.sessions || []]);
        }
      });

      // server.on('changed', ({ collection }) => console.log(`Changed collection ${collection}`));

      server.sub('livetimingFeed', [feed]);

      return () => {
        console.log("Disconnecting"); // eslint-disable-line no-console
        server.disconnect();
      };
    },
    [dispatch, feed, port, service]
  );

  return (
    <Session
      collections={collections}
      server={ddp.current}
    />
  );
};


Service.regex = /livetiming\.alkamelsystems\.com\/[0-9a-zA-Z]+/;
