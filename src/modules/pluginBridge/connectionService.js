import { EventEmitter } from "../../eventEmitter";
import { WrappedEventSource } from './eventSource';
import { WrappedWebsocket } from './websocket';

export class WebConnectionService extends EventEmitter {
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
    if (origin === this._expectedOrigin && data) {
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

  createWebsocket(url, { tag=undefined, autoReconnect=true, protocols=[] }={}) {

    if (url.slice(0, 5) === 'ws://' && !url.startsWith('ws://localhost') && process.env.NODE_ENV !== 'development') {
      console.warn(`Attempting to connect to an insecure WebSocket: ${url}. In order to connect, the connection will be proxied via Timing71 servers.`); // eslint-disable-line no-console

      const hasQueryString = url.indexOf('?') > -1;

      return new WrappedWebsocket(`wss://wsp.beta.timing71.org/?insecureWebsocket=${url.slice(5, hasQueryString ? url.indexOf('?') : undefined)}`, this, tag, autoReconnect, protocols);
    }

    return new WrappedWebsocket(url, this, tag, autoReconnect, protocols);
  }

  createEventSource(url, { tag=undefined, autoReconnect=true }={}) {
    return new WrappedEventSource(url, this, tag, autoReconnect);
  }

  createDOMParser() {
    return new DOMParser();
  }

  async listRecentSources() {
    const result = await this.send({ 'type': 'RETRIEVE_SOURCES_LIST' });
    return result.sources || [];
  }

  disconnect() {
    window.removeEventListener('message', this.receive);
  }

}
