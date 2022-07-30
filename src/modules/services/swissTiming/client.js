import { createSocketIo } from "../../socketio";
import { EventEmitter } from '../../../eventEmitter';
import { lzwDecode, patch } from "./data";

const HOST = 'livestats-lb.sportresult.com';

const PREHEADER_LENGTH = 10;

export class Client extends EventEmitter {
  constructor(namespace, profile, serviceUUID, connectionService) {

    super();

    this.namespace = namespace;
    this.profile = profile;
    this.connectionService = connectionService;

    this._data = {};
    this._meta = {};

    this._handlePacket = this._handlePacket.bind(this);
    this.init_async_data = this.init_async_data.bind(this);
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

  on_message(msg) {
    if (msg.length > PREHEADER_LENGTH && msg[PREHEADER_LENGTH] === '{') {
      const headerLength = parseInt(msg.slice(0, PREHEADER_LENGTH), 10);
      const header = JSON.parse(msg.slice(PREHEADER_LENGTH, PREHEADER_LENGTH + headerLength));
      const body = msg.slice(PREHEADER_LENGTH + headerLength);

      if (header.compressor === 'lzw') {
        try {
          const original = lzwDecode(body);
          const data = JSON.parse(decodeURIComponent(original));
          this.handle_async_data(data);
        }
        catch (e) {
          console.warn('Failed async data fetch', body); // eslint-disable-line no-console
        }
      }
    }
  }

  on_ready() {
    this.subscribe('SEASONS', 'seasons');
  }

  init_async_data(eventName) {
    return (room, meta) => {

      if (meta.CurrentSync || !this._meta[room]) {
        const requiresSync = this._meta[room]?.CurrentSync !== meta.CurrentSync;
        this._meta[room] = {
          ...meta,
          eventName
        };
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
      }
    };
  }

  handle_async_data(data) {
    if (data.Channel) {
      const room = data.Channel;
      const requiresSync = this._meta[room]?.CurrentSync !== data.sync;
      if (requiresSync) {
        const meta = this._meta[room];
        const dataURL = `${meta.CachingClusterURL}${room.replaceAll('|', '/')}/${data.sync}.json?t=0`;
        this.connectionService.fetch(dataURL).then(
          resp => {
            try {
              const jsonData = JSON.parse(resp);
              this._apply_data(room, jsonData);
              this._meta[room].CurrentSync = meta.sync;
              this.emit(meta.eventName, room, this._data[room]);
            }
            catch (e) {
              console.warn('Error applying async data; performing full reload', room, resp);  // eslint-disable-line no-console
              this._meta[room].CurrentSync = 0;
              this.init_async_data(meta.eventName)(room, this._meta[room]);
            }
          }
        );
      }
    }
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
       this.init_async_data(eventName)
    );
    if (handler) {
      this.on(eventName, handler);
    }
  }
}
