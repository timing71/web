import { Service } from '../service';
import { createSignalRConnection } from '../signalr';

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
      socket => {
        this.socket = socket;
      }
    );

  }

  stop() {
    this.socket && this.socket.close();
  }

}

TSL.regex = /livetiming.tsl-timing.com\/[0-9]+/;
