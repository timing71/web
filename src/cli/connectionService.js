import fetch from "cross-fetch";
import WebSocket from 'ws';

export const connectionService = {
  fetch: async (url, { returnHeaders=false, ...options }={}) => {
    const response = await fetch(url, options);
    const text = await response.text();
    if (returnHeaders) {
      return [text, Object.fromEntries(response.headers.entries())];
    }
    return text;
  },

  createWebsocket: (url, options) => new WebSocket(url, options)
};
