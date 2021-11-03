import { EventEmitter } from "./eventEmitter";

export class Port extends EventEmitter {
  constructor() {
    super();
    this._messageCount = 0;
    this.send = this.send.bind(this);
    this.fetch = this.fetch.bind(this);

    this._interval = null;
  }

  wrap(port) {
    if (this._interval) {
      window.clearInterval(this._interval);
      this._interval = null;
    }
    this._wrapped = port;
    port.onMessage.addListener(
      (msg) => {
        this.emit('message', msg);
      }
    );
    this._interval = window.setInterval(
      () => this.send({ type: 'KEEP_ALIVE' }),
      60000
    );
    port.onDisconnect.addListener(
      () => {
        if (this._interval) {
          window.clearInterval(this._interval);
          this._interval = null;
        }
      }
    );
  }

  send(message) {
    const messageIdx = this._messageCount++;

    return new Promise(
      (resolve, reject) => {

        const listener = (msg) => {
          if (msg.messageIdx === messageIdx) {
            resolve(msg.message);
            this._wrapped.onMessage.removeListener(listener);
          }
        };

        this._wrapped.onMessage.addListener(listener);
        this._wrapped.postMessage({ messageIdx, message });
      }
    );
  }

  async fetch(url, options={}) {
    const response = await this.send({ type: 'FETCH', options, url });
    return response.data;
  }

  disconnect() {
    this._wrapped && this._wrapped.disconnect();
  }

}
