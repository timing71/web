import { v4 as uuid } from 'uuid';
import { EventEmitter } from './eventEmitter';

export class WrappedWebsocket extends EventEmitter {

  constructor(url, port, tag=uuid()) {
    super();
    this.tag = tag;
    this._port = port;

    port.on('message', (msg) => {
      if (msg.tag === this.tag) {
        if (msg.type === 'WEBSOCKET_MESSAGE') {
          this.onReceivedMessage(msg);
        }
        else if (msg.type === 'WEBSOCKET_OPEN') {
          this.emit('open');
          if (this.onopen) {
            this.onopen();
          }
        }
      }
    });

    port.send({
      tag: this.tag,
      type: 'OPEN_WEBSOCKET',
      url
    });
  }

  onReceivedMessage(msg) {
    this.emit('message', msg.data);
    if (this.onmessage) {
      this.onmessage(msg.data);
    }
  }

  send(data) {
    this._port.send({
      type: 'WEBSOCKET_SEND',
      tag: this.tag,
      data
    });
  }

  close() {
    this._port.send({
      type: 'WEBSOCKET_CLOSE',
      tag: this.tag
    });
  }
}
