import { useContext, useEffect, useRef } from "react";
import simpleDDP from "simpleddp";
import { PluginContext, WrappedWebsocket } from "../../pluginBridge";

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

      server.sub('livetimingFeed', ['imsa']);

      server.on('ready', console.log)

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
