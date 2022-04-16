import { Service } from '../service';
import { createSignalRConnection } from '../signalr';
import { Client } from './client';

export class TSL extends Service {

  constructor(...args) {
    super(...args);

    this.sessionID = this.service.source.slice(this.service.source.lastIndexOf('/') + 1);
  }

  start(connectionService) {

    createSignalRConnection(
      connectionService,
      'livetiming.tsl-timing.com',
      'signalr',
      'livetiming',
      2.1,
      this.service.uuid
    ).then(
      ({ hub }) => {
        this.client = new Client(hub, this.sessionID, this.onStateChange, this.onManifestChange);
      }
    );

  }

  stop() {
    this.client && this.client.close();
  }

}

TSL.regex = /livetiming.tsl-timing.com\/[0-9]+/;
