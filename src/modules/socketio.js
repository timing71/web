const { Decoder, Encoder } = require('socket.io-parser');

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


export const createSocketIo = (host, uuid, port, callback, forceWebsocket=false) => {
  // In which we badly reimplement some of socket.io's transport handling
  // Ideally we could implement a socket.io client in the plugin and use
  // message passing to send data to the web client.
  const socketURL = `${host}/socket.io/?EIO=4`;
  const pollingUrl = `https://${socketURL}&transport=polling`;
  const wsUrl = `wss://${socketURL}&transport=websocket`;

  let sid = null;

  let ws = null;
  let pingInterval = null;
  let polling = true;
  let usingWebsocket = false;

  const pollDecoder = new Decoder();
  const wsDecoder = new Decoder();

  const encoder = new Encoder();

  const _rooms = {};
  let _roomsIndex = 0;

  const doPoll = () => {
    if (polling) {
      let myUrl = `${pollingUrl}&t=${yeast()}`;
      if (sid) {
        myUrl += `&sid=${sid}`;
      }
      port.fetch(myUrl).then(
        pollData => {
          splitPayload(pollData).forEach(
            msg => pollDecoder.add(msg)
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
    ws = port.createWebsocket(wsUrl, uuid);
    ws.on('open', () => {
      ws.readyState === 1 && ws.send('2probe');
    });
    ws.on('close', () => {
      pingInterval && window.clearInterval(pingInterval);
      usingWebsocket = false;
      polling = true;
      sid = null;
      doPoll();
    });
    ws.on('message', (data) => {
      if (data.data) {
        wsDecoder.add(data.data);
      }
      else if (typeof(data.buffer !== 'undefined')) {
        wsDecoder.add(data.toString());
      }
    });
    pingInterval = window.setInterval(
      () => ws.readyState === 1 && ws.send('2'),
      20000
    );
  };

  const handlePacket = isWebsocket => (packet) => {
    if (packet.type === 4 && packet.data) {
      if (isWebsocket && polling) {
        // polling = false;  // ACO server not responding to probe but sending us useful data
      }
      const [event, data] = packet.data;

      if (_rooms[packet.id]) {
        _rooms[packet.id](data, event);
      }
      else {
        callback && callback(event, data);
      }

    }
    else if (packet.type === 3) {
      // Successful response from websocket
      polling = false;
    }
    else if (packet.type === 0) {
      if (packet.data.sid) {
        sid = encodeURIComponent(packet.data.sid);
      }
      if (packet.data.upgrades.includes('websocket') && !usingWebsocket) {
        usingWebsocket = true;
        doWebsocket();
      }
    }
  };

  wsDecoder.on('decoded', handlePacket(true));
  pollDecoder.on('decoded', handlePacket(false));

  if (forceWebsocket) {
    usingWebsocket = true;
    doWebsocket();
  }
  else {
    doPoll();
  }

  return {

    join(room, callback) {
      const myIndex = _roomsIndex++;
      const encoded = encoder.encode({
        type: `42${myIndex}`,
        nsp: '/',
        data: ['join', room]
      });

      _rooms[`3${myIndex}`] = callback;

      if (usingWebsocket) {
        ws.send(encoded);
      }
      else {
        console.error('Non-WS sending not yet supported'); //eslint-disable-line no-console
      }
    },

    stop: () => {
      pingInterval && window.clearInterval(pingInterval);
      ws && ws.close();
    }
  };
};
