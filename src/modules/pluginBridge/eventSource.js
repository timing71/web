import { v4 as uuid } from 'uuid';

export class WrappedEventSource {

  constructor(url, port, tag=uuid()) {
    this.tag = tag;
    this._port = port;
    this.readyState = 0;

    port.on('message', (msg) => {
      if (msg.tag === this.tag) {
        if (msg.type === 'EVENT_SOURCE_MESSAGE') {
          this.onReceivedMessage(msg);
        }
        else if (msg.type === 'EVENT_SOURCE_OPEN') {
          this.readyState = 1;
          if (this.onopen) {
            this.onopen();
          }
        }
        else if (msg.type === 'EVENT_SOURCE_ERROR' && this.onerror) {
          this.onerror(msg.error);
        }
      }
    });

    port.send({
      tag: this.tag,
      type: 'OPEN_EVENT_SOURCE',
      url
    });
  }

  onReceivedMessage(msg) {
    Promise.resolve().then(
      () => {
        if (this.onmessage) {
          this.onmessage({ data: msg.data });
        }
      }
    );
  }

  close() {
    this._port.send({
      type: 'CLOSE_EVENT_SOURCE',
      tag: this.tag
    });
    this.readyState = 2;
  }

}
