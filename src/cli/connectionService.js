import fetch from "cross-fetch";
import ReconnectingWebSocket from 'reconnecting-websocket';
import WebSocket from 'ws';


class WrappedReconnectingWebSocket extends ReconnectingWebSocket {

  on(event, handler) {
    return this.addEventListener(event, handler);
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
