import { Service } from '../service';
import { Client } from './client';

export class Natsoft extends Service {

  constructor(...args) {
    super(...args);
    this._socket = null;
  }

  start(connectionService) {

    const wsURL = this.service.source.replace(/^t71 Natsoft:\/\//i, '').replace(/^https?:/, 'ws:');

    this._client = new Client(connectionService.createDOMParser(), this.onStateChange, this.onManifestChange);

    this._socket = connectionService.createWebsocket(
      wsURL,
      {
        autoReconnect: false,
        tag: this.service.uuid
      }
    );
    this._socket.onmessage = (m) => {
      if (m.data) {
        this._client.handlePacket(m.data);
      }
      else if (typeof(m.toString) === 'function') {
        this._client.handlePacket(m.toString());
      }
    };

  }

  stop() {

  }

}

Natsoft.regex = /\/LiveMeeting\//; // Ick, this is a bit tentative...
