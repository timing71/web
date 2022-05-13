import { Service } from '../service';
import { Client, RedirectError } from './client';

export class Natsoft extends Service {

  constructor(...args) {
    super(...args);
    this._socket = null;

    this.wsURL = this.service.source.replace(/^t71 Natsoft:\/\//i, '').replace(/^https?:/, 'ws:');
  }

  start(connectionService) {

    this._client = new Client(connectionService.createDOMParser(), this.onStateChange, this.onManifestChange);

    this._socket = connectionService.createWebsocket(
      this.wsURL,
      {
        autoReconnect: false,
        tag: this.service.uuid
      }
    );
    this._socket.onmessage = (m) => {
      try {
        if (m.data) {
          this._client.handlePacket(m.data);
        }
        else if (typeof(m.toString) === 'function') {
          this._client.handlePacket(m.toString());
        }
      }
      catch (err) {
        if (err instanceof RedirectError) {
          this.wsURL = err.url.replace(/^https?:/, 'ws:');
          this._socket.close();
          this.start(connectionService);
        }
      }
    };

  }

  stop() {
    this._socket && this._socket.close();
  }

}

Natsoft.regex = /\/LiveMeeting\//; // Ick, this is a bit tentative...
