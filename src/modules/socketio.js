import { useContext, useEffect } from 'react';
import { PluginContext, WrappedWebsocket } from './pluginBridge';

const { Decoder } = require('socket.io-parser');

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('');
const length = 64;
let prev, seed = 0;

function encode(num) {
  var encoded = '';

  do {
    encoded = alphabet[num % length] + encoded;
    num = Math.floor(num / length);
  } while (num > 0);

  return encoded;
}

function yeast() {
  var now = encode(+new Date());
  if (now !== prev) {
    seed = 0;
    prev = now;
    return prev;
  }
  return now + '.' + encode(seed++);
}

export const useSocketIo = (host, uuid, callback) => {
  const port = useContext(PluginContext);
  const socketURL = `${host}/socket.io/?EIO=4`;
  const pollingUrl = `https://${socketURL}&transport=polling`;
  const wsUrl = `wss://${socketURL}&transport=websocket`;
  useEffect(
    // In which we badly reimplement some of socket.io's transport handling
    // Ideally we could implement a socket.io client in the plugin and use
    // message passing to send data to the web client.
    () => {

      let sid = null;

      const decoder = new Decoder();
      decoder.on('decoded', (packet) => {
        if (packet.type === 4 && packet.data) {
          const [event, data] = packet.data;
          callback && callback(event, data);
        }
      });

      let ws = null;
      let pingInterval = null;

      port.fetch(pollingUrl).then(
        firstPollData => {
          try {
            const data = JSON.parse(firstPollData.slice(4, -4));

            sid = encodeURIComponent(data.sid);

            if ((data.upgrades || []).includes('websocket')) {
              // Technically we should include the sid in the websocket URL;
              // but I don't want to reimplement socket.io's session handling...
              ws = new WrappedWebsocket(wsUrl, port, uuid);
              ws.on('message', data => decoder.add(data));
              pingInterval = window.setInterval(
                () => ws.send('2'),
                20000
              );

            }
            else {
              // No websockets available
              const doPoll = () => {
                port.fetch(`${pollingUrl}&sid=${sid}&t=${yeast()}`).then(
                  pollData => {
                    decoder.add(pollData.slice(pollData.indexOf(':') + 1));
                    doPoll();
                  }
                );
              };
              doPoll();
            }
          }
          catch (e) {

          }
        }
      );

      return () => {
        pingInterval && window.clearInterval(pingInterval);
        ws && ws.close();
      };

    },
    [callback, pollingUrl, port, uuid, wsUrl]
  );
};
