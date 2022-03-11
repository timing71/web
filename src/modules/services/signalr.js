export const createSignalRConnection = async (connectionService, host, prefix='signalr', hubName='streaming', clientProtocol=2.1, tag) => {
  const negotiateURL = `https://${host}/${prefix}/negotiate?clientProtocol=${clientProtocol}&connectionData=%5B%7B%22name%22%3A%22${hubName}%22%7D%5D&_=${Date.now()}`;

  const negotiate = await connectionService.fetch(negotiateURL);

  const data = JSON.parse(negotiate);
  const token = encodeURIComponent(data['ConnectionToken']);

  const connectURL = `wss://${host}/${prefix}/connect?transport=webSockets&clientProtocol=${clientProtocol}&connectionToken=${token}&connectionData=%5B%7B%22name%22%3A%22${hubName}%22%7D%5D&tid=${Math.floor(11 * Math.random())}`;

  const socket = connectionService.createWebsocket(
    connectURL,
    tag
  );

  return socket;

};
