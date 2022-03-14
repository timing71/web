import cookie from 'cookie';
import queryString from 'query-string';

export const createSignalRConnection = async (connectionService, host, prefix = 'signalr', hubName = 'streaming', clientProtocol = 2.1, tag) => {
  const negotiateQuery = queryString.stringify({
    connectionData: JSON.stringify([{ "name": hubName }]),
    clientProtocol,
    _: Date.now()
  });
  const negotiateURL = `https://${host}/${prefix}/negotiate?${negotiateQuery}`;

  const [negotiate, negHeaders] = await connectionService.fetch(negotiateURL, { returnHeaders: true });
  console.log(negHeaders)

  let GCLB = null;
  if (negHeaders['set-cookie']) {
    console.log("Om nom nom cookies")
    const cookies = cookie.parse(negHeaders['set-cookie']);
    if (cookies.GCLB) {
      GCLB = cookies.GCLB;
    }
  }

  const headers = {};

  if (GCLB) {
    headers['cookie'] = `GCLB=${GCLB}`;
  }
  console.log(headers)

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

  await connectionService.fetch(startURL, { headers });

  const socket = connectionService.createWebsocket(
    connectURL,
    {
      tag,
      headers
    }
  );

  return socket;

};
