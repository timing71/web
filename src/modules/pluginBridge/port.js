import { EventEmitter } from "../../eventEmitter";
import { WrappedWebsocket } from './websocket';

export class Port extends EventEmitter {
  constructor(extensionID, targetWindow) {
    super();
    this._messageCount = 0;
    this.send = this.send.bind(this);
    this.fetch = this.fetch.bind(this);
    this.receive = this.receive.bind(this);

    this._target = targetWindow;
    this._expectedOrigin = `chrome-extension://${extensionID}`;
    this._promises = {};

    window.addEventListener('message', this.receive);
  }

  receive({ data, origin }) {
    if (origin === this._expectedOrigin) {
      if (data.id !== undefined && this._promises[data.id]) {
        // Handle replies being received
        if (data.message?.error) {
          this._promises[data.id][1](data.message);
        }
        else {
          this._promises[data.id][0](data.message);
        }
        delete this._promises[data.id];
      }
      else {
        this.emit('message', data);
      }
    }
  }

  send(message) {
    const id = this._messageCount++;

    return new Promise(
      (resolve, reject) => {

        this._promises[id] = [resolve, reject];
        this._target.postMessage(
          { id, message },
          this._expectedOrigin
        );

      }
    );
  }

  async fetch(url, { returnHeaders=false, ...options }={}) {
    const response = await this.send({ type: 'FETCH', options, url });
    return returnHeaders ? [response.data, response.headers] : response.data;
  }

  createWebsocket(url, { tag=undefined, autoReconnect=true }) {
    return new WrappedWebsocket(url, this, tag, autoReconnect);
  }

  disconnect() {
    window.removeEventListener('message', this.receive);
  }

}
