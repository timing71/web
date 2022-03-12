import queryString from 'query-string';

export const createSignalRConnection = async (connectionService, host, prefix = 'signalr', hubName = 'streaming', clientProtocol = 2.1, tag) => {
  const negotiateQuery = queryString.stringify({
    connectionData: JSON.stringify([{ "name": hubName }]),
    clientProtocol,
    _: Date.now()
  });
  const negotiateURL = `https://${host}/${prefix}/negotiate?${negotiateQuery}`;

  const negotiate = await connectionService.fetch(negotiateURL);

  const data = JSON.parse(negotiate);
  const token = data['ConnectionToken'];

  const connectQuery = queryString.stringify({
    clientProtocol,
    transport: "webSockets",
    connectionToken: token,
    connectionData: JSON.stringify([{ "name": hubName }]),
    tid: Math.floor(11 * Math.random())
  });
  const connectURL = `wss://${host}/${prefix}/connect?${connectQuery}`;

  const startQuery = queryString.stringify({
    transport: 'webSockets',
    clientProtocol,
    connectionData: JSON.stringify([{ "name": hubName }]),
    connectionToken: token,
    _: Date.now()
  });
  const startURL = `https://${host}/${prefix}/start?${startQuery}`;

  await connectionService.fetch(startURL);

  const socket = connectionService.createWebsocket(
    connectURL,
    tag
  );

  return socket;

};
