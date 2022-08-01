import throttle from 'lodash.throttle';

import { Client } from './client';
import { createSocketIo } from "../../socketio";
import { Service } from '../service';

export class ACO extends Service {
  constructor(host, name, onStateChange, onManifestChange, service) {
    super(onStateChange, onManifestChange, service);
    this._host = host;
    this._name = name;

    this._onUpdate = throttle(
      this._onUpdate.bind(this),
      500
    );

    this._raceControlIndex = -1;

    this._socketIO = null;
  }

  _onUpdate(client) {
    const newState = client.getState(this._raceControlIndex < 0 ? 9999999999 : this._raceControlIndex);
    this._raceControlIndex = Math.max(newState.meta.raceControlIndex || -1, this._raceControlIndex);
    this.onStateChange(newState);
  }

  start(connectionService) {
    const client = new Client(
      this._host.replace('data.', 'live.'),
      this._name,
      this._onUpdate,
      this.onManifestChange,
      connectionService.fetch
    );

    this._socketIO = createSocketIo(
      this._host,
      connectionService,
      client.handle
    );

  }

  stop() {
    this._socketIO.stop();
  }
}
