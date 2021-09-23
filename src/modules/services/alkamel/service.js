import { useContext, useEffect, useReducer, useRef } from "react";
import simpleDDP from "simpleddp";

import { PluginContext, WrappedWebsocket } from "../../pluginBridge";
import { dispatchAdded } from "./ddp";
import { Session } from "./session";

const stateReducer = (state, action) => {
  const [name, collection] = action;
  return {
    ...state,
    [name]: collection
  };
};

const MONITORED_COLLECTIONS = [
  'best_results',
  'race_control',
  'sessionBestResultsByClass',
  'sessions',
  'session_info',
  'session_entry',
  'standings',
  'track_info',
  'weather'
];

export const Service = ({ children, service, updateManifest, updateState }) => {
  const port = useContext(PluginContext);
  const [collections, dispatch] = useReducer(stateReducer, {});

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
        endpoint: 'wss://livetiming.alkamelsystems.com/sockjs/123/abcdefgh/websocket',
        SocketConstructor: AlkamelSocket
      });
      // Evil monkeypatch:
      server.dispatchAdded = dispatchAdded;

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

      server.sub('livetimingFeed', ['imsa']);

      return () => {
        console.log("Disconnecting"); // eslint-disable-line no-console
        server.disconnect();
      };
    },
    [dispatch, port, service]
  );

  return (
    <>
      <Session
        collections={collections}
        server={ddp.current}
        updateManifest={updateManifest}
        updateState={updateState}
      />
      {children}
    </>
  );
};


Service.regex = /livetiming\.alkamelsystems\.com/;
