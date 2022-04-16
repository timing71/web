import cookie from 'cookie';
import queryString from 'query-string';

import { EventEmitter } from '../../eventEmitter';

export const createSignalRConnection = async (connectionService, host, prefix = 'signalr', hubName = 'streaming', clientProtocol = 2.1, tag) => {
  const negotiateQuery = queryString.stringify({
    connectionData: JSON.stringify([{ "name": hubName }]),
    clientProtocol,
    _: Date.now()
  });
  const negotiateURL = `https://${host}/${prefix}/negotiate?${negotiateQuery}`;

  const [negotiate, negHeaders] = await connectionService.fetch(negotiateURL, { returnHeaders: true });

  let GCLB = null;
  if (negHeaders['set-cookie']) {
    const cookies = cookie.parse(negHeaders['set-cookie']);
    if (cookies.GCLB) {
      GCLB = cookies.GCLB;
    }
  }

  const headers = {};

  if (GCLB) {
    headers['cookie'] = `GCLB=${GCLB}`;
  }

  const data = JSON.parse(negotiate);
  const token = data['ConnectionToken'];

  const connectQuery = queryString.stringify({
    clientProtocol,
    transport: "webSockets",
    connectionToken: token,
    connectionData: JSON.stringify([{ "name": hubName }]),
    tid: Math.floor(11 * Math.random())
  });
  const connectURL = `wss://${host}/${prefix}/connect?${connectQuery}`;

  const startQuery = queryString.stringify({
    transport: 'webSockets',
    clientProtocol,
    connectionData: JSON.stringify([{ "name": hubName }]),
    connectionToken: token,
    _: Date.now()
  });
  const startURL = `https://${host}/${prefix}/start?${startQuery}`;

  await connectionService.fetch(startURL, { headers });

  const socket = connectionService.createWebsocket(
    connectURL,
    {
      tag,
      headers
    }
  );

  const hub = new Hub(socket, hubName);

  return { hub, socket };

};


class Hub extends EventEmitter {
  constructor(socket, hubName) {
    super();
    this._socket = socket;
    this._hubName = hubName.toLowerCase();

    this._index = 0;
    this._handlers = {};

    this._handleMessage = this._handleMessage.bind(this);
    this.call = this.call.bind(this);

    this._socket.on(
      'open',
      () => {
        this.emit('connected');
      }
    );

    this._socket.on(
      'message',
      (rawMsg) => {
        if (rawMsg.data) {
          this._handleMessage(
            JSON.parse(rawMsg.data)
          );
        }
        else {
          this._handleMessage(
            JSON.parse(rawMsg.toString())
          );
        }
      }
    );
  }

  _handleMessage(msg) {
    if (msg.M) {
      msg.M.forEach(
        message => {
          if (message.H.toLowerCase() === this._hubName) {
            this.emit(
              message.M.toLowerCase(),
              message.A
            );
          }
        }
      );
    }
    else if (msg.I) {
      if (!!this._handlers[msg.I]) {
        this._handlers[msg.I](msg.R, msg.E);
      }
    }
  }

  call(method, ...args) {
    const myIndex = this._index++;
    const msg = JSON.stringify({
      H: this._hubName,
      M: method,
      A: args,
      I: myIndex
    });

    return new Promise(
      (resolve, reject) => {
        this._handlers[myIndex] = (data, error) => {
          !!error ? reject(error) : resolve(data);
          delete this._handlers[myIndex];
        };
        this._socket.send(msg);
      }
    );

  }

  close() {
    this._socket.close();
  }
}
