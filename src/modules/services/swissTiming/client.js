import { createSocketIo } from "../../socketio";

const HOST = 'livestats-lb.sportresult.com';

export class Client {
  constructor(namespace, profile, serviceUUID, connectionService, onChange) {
    this.namespace = namespace;
    this.profile = profile;

    this._onChange = onChange;

    this._handlePacket = this._handlePacket.bind(this);

    this._socket = createSocketIo(
      HOST,
      serviceUUID,
      connectionService,
      this._handlePacket
    );
  }

  _handlePacket(event, data) {
    console.log(event, data)
  }
}
