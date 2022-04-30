import { createSocketIo } from "../../socketio";
import { EventEmitter } from '../../../eventEmitter';
import { patch } from "./data";

const HOST = 'livestats-lb.sportresult.com';

export class Client extends EventEmitter {
  constructor(namespace, profile, serviceUUID, connectionService) {

    super();

    this.namespace = namespace;
    this.profile = profile;
    this.connectionService = connectionService;

    this._data = {};
    this._meta = {};

    this._handlePacket = this._handlePacket.bind(this);
    this.handle_async_data = this.handle_async_data.bind(this);
    this.subscribe = this.subscribe.bind(this);

    this._socket = createSocketIo(
      HOST,
      serviceUUID,
      connectionService,
      this._handlePacket,
      true
    );
  }

  _handlePacket(event, data) {
    if (typeof(this[`on_${event.toLowerCase()}`]) === 'function') {
      this[`on_${event.toLowerCase()}`](data);
    }
  }

  on_ready() {
    this.subscribe('SEASONS', 'seasons');
  }

  handle_async_data(eventName) {
    return (room, meta) => {
      const requiresSync = this._meta[room]?.CurrentSync !== meta.CurrentSync;
      this._meta[room] = meta;
      if (requiresSync) {
        const dataURL = `${meta.CachingClusterURL}${room.replaceAll('|', '/')}.json?s=${meta.CurrentSync}`;

        this.connectionService.fetch(dataURL).then(
          resp => {
            const jsonData = JSON.parse(resp);
            this._apply_data(room, jsonData);
            this.emit(eventName, room, this._data[room]);
          }
        );

      }
    };
  }

  _apply_data(room, data) {
    if (data.content?.full) {
      this._data[room] = data.content.full;
    }
    else {
      this._data[room] = patch(this._data[room], data);
    }
  }

  subscribe(room, eventName, handler) {
    this._socket.join(
      `${this.namespace}|${this.profile}_${room}_JSON`,
       this.handle_async_data(eventName)
      );
    if (handler) {
      this.on(eventName, handler);
    }
  }
}
