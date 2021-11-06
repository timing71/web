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

const splitPayload = (data) => {
  // Based on https://github.com/socketio/engine.io-parser/blob/2.2.x/lib/browser.js#L371
  const messages = [];
  let length = '', n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (chr !== ':') {
      length += chr;
      continue;
    }

    if (length === '' || (length != (n = Number(length)))) { // eslint-disable-line eqeqeq
      // parser error - ignoring payload
      return messages;
    }

    msg = data.substr(i + 1, n);

    if (length != msg.length) { // eslint-disable-line eqeqeq
      // parser error - ignoring payload
      return messages;
    }

    if (msg.length) {
      messages.push(msg);
    }

    // advance cursor
    i += n;
    length = '';
  }
  return messages;
};

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

      let ws = null;
      let pingInterval = null;
      let polling = true;

      const decoder = new Decoder();

      const doPoll = () => {
        if (polling) {
          let myUrl = `${pollingUrl}&t=${yeast()}`;
          if (sid) {
            myUrl += `&sid=${sid}`;
          }
          port.fetch(myUrl).then(
            pollData => {
              splitPayload(pollData).forEach(
                msg => decoder.add(msg)
              );
              setTimeout(doPoll, 1000);
            }
          ).catch(
            () => {
              sid = null;
              doPoll();
            }
          );
        }
      };

      const doWebsocket = () => {
        // Technically we should include the sid in the websocket URL;
        // but I don't want to reimplement socket.io's session handling...
        ws = new WrappedWebsocket(wsUrl, port, uuid);
        ws.on('open', () => {
          ws.send('2probe');
        });
        ws.on('close', () => {
          pingInterval && window.clearInterval(pingInterval);
          polling = true;
          sid = null;
          doPoll();
        });
        ws.on('message', data => decoder.add(data));
        pingInterval = window.setInterval(
          () => ws.send('2'),
          20000
        );
      };

      decoder.on('decoded', (packet) => {
        if (packet.type === 4 && packet.data) {
          const [event, data] = packet.data;
          callback && callback(event, data);
        }
        else if (packet.type === 3) {
          // Successful response from websocket
          polling = false;
        }
        else if (packet.type === 0) {
          if (packet.data.sid) {
            sid = encodeURIComponent(packet.data.sid);
          }
          if (packet.data.upgrades.includes('websocket')) {
            doWebsocket();
          }
        }
      });

      doPoll();

      return () => {
        pingInterval && window.clearInterval(pingInterval);
        ws && ws.close();
      };

    },
    [callback, pollingUrl, port, uuid, wsUrl]
  );
};
