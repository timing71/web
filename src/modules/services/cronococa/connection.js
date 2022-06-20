import { EventEmitter } from "../../../eventEmitter";

const DEFAULT_HOST = '35.181.117.221';
const DEFAULT_PORT = 843;

const PACKET_REGEX = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;

const PacketTypes = {
  DISCONNECT: '0',
  CONNECT: '1',
  HEARTBEAT: '2',
  MESSAGE: '3',
  JSON: '4',
  EVENT: '5',
  ACK: '6',
  ERROR: '7',
  NOOP: '8'
};

// Cronococa uses a very old (< 1.0) version of Socket.IO, so we don't want
// to use the `createSocketIO` function. Instead, we implement only as much of
// Socket.IO as is used by Cronococa (heartbeat and events over websocket).
export class Connection extends EventEmitter {

  constructor(host=DEFAULT_HOST, port=DEFAULT_PORT) {
    super();
    this.host = host;
    this.port = port;

    this._socket = null;

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  async start(connectionService) {
    const params = await connectionService.fetch(`http://${this.host}:${this.port}/socket.io/1/?t=${Date.now()}`);
    const token = params.split(':')[0];

    const wsURL = `ws://${this.host}:${this.port}/socket.io/1/websocket/${token}`;

    this._socket = connectionService.createWebsocket(wsURL);

    this._socket.onmessage = (m) => {
      if (m.data) {
        this.handleMessage(m.data);
      }
      else if (typeof(m.toString) === 'function') {
        this.handleMessage(m.toString());
      }
    };
  }

  handleMessage(data) {
    const pieces = data.match(PACKET_REGEX);

    if (pieces) {
      const packetType = pieces[1];
      //const id = pieces[2] || '';
      //const needsAck = !!pieces[3];
      //const endpoint = pieces[4] || '';
      const data = pieces[5] || '';

      if (packetType === PacketTypes.HEARTBEAT) {
        this._socket.send('2::');
      }
      else if (packetType === PacketTypes.EVENT) {
        try {
          const opts = JSON.parse(data);
          this.emit(opts.name, ...opts.args.map(a => JSON.parse(a)));
        }
        catch {
          // duff packet - do nothing
        }
      }
    }

  }

  stop() {
    if (this._socket) {
      this._socket.close();
    }
  }
}
