import fetch from "cross-fetch";
import WebSocket from 'ws';

export const connectionService = {
  fetch: async (url) => {
    const response = await fetch(url);
    const text = await response.text();
    return text;
  },

  createWebsocket: url => new WebSocket(url)
};
