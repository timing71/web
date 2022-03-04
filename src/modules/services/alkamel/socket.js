import { EventEmitter } from '../../../eventEmitter';

export class AlkamelSocket extends EventEmitter {

  constructor(port, url, tag) {
    super();
    this.onReceivedMessage = this.onReceivedMessage.bind(this);

    this._socket = port.createWebsocket(url, tag);

    this._socket.on(
      'message',
      this.onReceivedMessage
    );

    this._socket.on('open', (e) => {
      this.emit('open', e);
      if (this.onopen) {
        this.onopen(e);
      }
    });
    this._socket.on('close', (e) => this.emit('close', e));
  }

  onReceivedMessage(msg) {
    if (msg.data[0] === 'a') {
      const mungedData = msg.data.slice(2, -1);

      const mungedMessage = {
        ...msg,
        data: mungedData.length > 0 ? JSON.parse(mungedData) : null
      };

      this.emit('message', mungedMessage);
      if (this.onmessage) {
        this.onmessage(mungedMessage);
      }

    }
    else if (msg.data[0] === 'c') {
      console.log("Upstream timing source disconnected!"); // eslint-disable-line no-console
    }
  }

  send(data) {
    return this._socket.send(JSON.stringify([data]));
  }

  close() {
    return this._socket && this._socket.close();
  }

}
