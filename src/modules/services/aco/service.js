import { useCallback, useContext, useEffect, useRef } from "react";

import { Client } from './client';
import { PluginContext, WrappedWebsocket } from "../../pluginBridge";

const { Decoder } = require('socket.io-parser');

export const Service = ({ children, host, name, service: { uuid }, updateManifest, updateState }) => {

  const port = useContext(PluginContext);
  const wsUrl = `wss://${host}/socket.io/?EIO=4&transport=websocket`;

  const onUpdate = useCallback(
    (client) => {
      updateManifest(client.getManifest());
      updateState(client.getState());
    },
    [updateManifest, updateState]
  );

  const client = useRef(new Client(name, onUpdate));

  useEffect(
    () => {

      const ws = new WrappedWebsocket(wsUrl, port, uuid);

      const decoder = new Decoder();
      decoder.on('decoded', (packet) => {
        if (packet.type === 4 && packet.data) {
          const [event, data] = packet.data;
          client.current.handle(event, data);
        }
      });

      ws.on(
        'message',
        data => {
          decoder.add(data);
        }
      );

      const pingInterval = window.setInterval(
        () => ws.send('2'),
        20000
      );

      return () => {
        window.clearInterval(pingInterval);
        ws.close();
      };

    },
    [port, uuid, wsUrl]
  );

  return (
    <>
      { children }
    </>
  );

};
