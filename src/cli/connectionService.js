import fetch from "cross-fetch";
import ReconnectingWebSocket from 'reconnecting-websocket';
import WebSocket from 'ws';


class WrappedReconnectingWebSocket extends ReconnectingWebSocket {

  on(event, handler) {
    return this.addEventListener(event, handler);
  }

  // Override superclass method to pass additional options to WebSocket constructor
  // (because we know we're nodejs not browser, we can do so)
  _connect() {
    if (this._connectLock || !this._shouldReconnect) {
        return;
    }
    this._connectLock = true;

    const {
        maxRetries = Infinity,
        connectionTimeout = 4000,
        ...otherOptions
    } = this._options;

    if (this._retryCount >= maxRetries) {
        this._debug('max retries reached', this._retryCount, '>=', maxRetries);
        return;
    }

    this._retryCount++;

    this._debug('connect', this._retryCount);
    this._removeListeners();

    this._wait()
        .then(() => this._getNextUrl(this._url))
        .then(url => {
            // close could be called before creating the ws
            if (this._closeCalled) {
                return;
            }
            this._ws = new WebSocket(url, otherOptions);
            if (this._ws) {
              this._ws.binaryType = this._binaryType;
            }
            this._connectLock = false;
            this._addListeners();

            this._connectTimeout = setTimeout(() => this._handleTimeout(), connectionTimeout);
        });
}

}

export const connectionService = {
  fetch: async (url, { returnHeaders=false, ...options }={}) => {
    const response = await fetch(url, options);
    const text = await response.text();
    if (returnHeaders) {
      return [text, Object.fromEntries(response.headers.entries())];
    }
    return text;
  },

  createWebsocket: (url, { autoReconnect=true, ...options }) => {
    if (autoReconnect) {
      return new WrappedReconnectingWebSocket(url, [], { WebSocket, ...options });
    }
    else {
      return new WebSocket(url, options);
    }
  }
};
