import { useContext, useEffect, useRef } from "react";
import simpleDDP from "simpleddp";
import EJSON from "ejson";

import { PluginContext, WrappedWebsocket } from "../../pluginBridge";

class oid {
  constructor(value) {
    this.value = value;
  }
  toJSONValue() {
    return this.value;
  }
  typeName() {
    return 'oid';
  }
}

EJSON.addType('oid', a => new oid(a));

export const Service = ({ children, service }) => {

  const port = useContext(PluginContext);

  const ddp = useRef();

  useEffect(
    () => {

      class AlkamelSocket extends WrappedWebsocket {

        constructor(url) {
          super(url, port, service.uuid);
        }

        onReceivedMessage(msg) {

          const mungedMessage = {
            ...msg,
            data: JSON.parse(msg.data.slice(2, -1))
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

      ddp.current = server;

      server.on('ready', console.log)
      server.on('added', ({ collection, fields }) => {
        console.log("Added", collection, fields)
        if (collection === 'feeds') {
          server.sub('sessions', [fields.sessions || []]);
        }
      });

      server.sub('livetimingFeed', ['imsa']);

      return () => {
        console.log("Disconnecting");
        server.disconnect();
      };
    },
    [port, service]
  );

  return (
    <p>Soon™ { JSON.stringify(service) }</p>
  );
};

Service.regex = /livetiming\.alkamelsystems\.com/;
