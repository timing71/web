import { useCallback, useContext, useEffect, useRef } from "react";

import { v4 as uuid } from 'uuid';

import { Client } from './client';
import { PluginContext } from "../../pluginBridge";

const { Decoder } = require('socket.io-parser');

export const Service = ({ children, host, name, updateManifest, updateState }) => {

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

      const tag = uuid();

      const decoder = new Decoder();
      decoder.on('decoded', (packet) => {
        if (packet.type === 4 && packet.data) {
          const [event, data] = packet.data;
          client.current.handle(event, data);
        }
      });

      port.onMessage.addListener(
        msg => {
          if (msg.type === 'WEBSOCKET_MESSAGE' && msg.tag === tag) {
            decoder.add(msg.data);
          }
        }
      );

      port.postMessage({
        tag,
        type: 'WEBSOCKET',
        url: wsUrl
      });
    },
    [port, wsUrl]
  );

  return (
    <>
      { children }
    </>
  );

};
