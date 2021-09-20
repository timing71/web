import { v4 as uuid } from 'uuid';
import { EventEmitter } from './eventEmitter';

export class WrappedWebsocket extends EventEmitter {
  constructor(url, port, tag=uuid()) {
    super();
    this.tag = tag;
    this._port = port;

    port.on('message', (msg) => {
      if (msg.type === 'WEBSOCKET_MESSAGE' && msg.tag === this.tag) {
        this.emit('message', msg.data);
      }
    });

    port.send({
      tag: this.tag,
      type: 'OPEN_WEBSOCKET',
      url
    });
  }

  send(data) {
    this._port.send({
      type: 'WEBSOCKET_SEND',
      tag: this.tag,
      data
    });
  }
}
