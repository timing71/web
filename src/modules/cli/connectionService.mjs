import fetch from 'node-fetch';

export const CLIConnectionService = {
  fetch: (url) => fetch(url).then(response => response.text())
};
