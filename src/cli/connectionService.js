import fetch from "cross-fetch";

export const connectionService = {
  fetch: async (url) => {
    const response = await fetch(url);
    const text = await response.text();
    return text;
  }
};
