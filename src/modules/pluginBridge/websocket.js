import { v4 as uuid } from 'uuid';
import { EventEmitter } from '../../eventEmitter';

export class WrappedWebsocket extends EventEmitter {

  constructor(url, port, tag=uuid(), autoReconnect=true) {
    super();
    this.tag = tag;
    this._port = port;
    this.readyState = 0;

    port.on('message', (msg) => {
      if (msg.tag === this.tag) {
        if (msg.type === 'WEBSOCKET_MESSAGE') {
          this.onReceivedMessage(msg);
        }
        else if (msg.type === 'WEBSOCKET_OPEN') {
          this.readyState = 1;
          this.emit('open');
          if (this.onopen) {
            this.onopen();
          }
        }
        else if (msg.type === 'WEBSOCKET_CLOSE') {
          this.readyState = 3;
          this.emit('close');
          if (this.onclose) {
            this.onclose();
          }
        }
      }
    });

    port.send({
      tag: this.tag,
      type: 'OPEN_WEBSOCKET',
      url,
      autoReconnect
    });
  }

  onReceivedMessage(msg) {
    this.emit('message', { data: msg.data });
    if (this.onmessage) {
      this.onmessage({ data: msg.data });
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
