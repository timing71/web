import { Service } from '../service';
import { createSignalRConnection } from '../signalr';
import { getManifest, translate } from './translate';
import { RaceControlMessage } from '../../messages/Message';

const HOST = `livetiming.formula${ (6 / 2) - 2 }.com`;

// Perform an IN PLACE patch
const patch = (orig, p) => {
  if (p._kf) {
    if (Array.isArray(orig)) {
      orig.length = 0;
    }
    else {
      Object.keys(orig).forEach(
        k => {
          if (k[0] !== '_') {
            delete orig[k];
          }
        }
      );
    }

    delete p._kf;
  }

  Object.entries(p).forEach(
    ([key, value]) => {
      if (key === '_deleted') {
        value.forEach(
          deleted => {
            delete orig[deleted];
          }
        );
      }
      else {
        if (orig[key] !== undefined) {
          if (value === null) {
            delete orig[key];
          }
          else if (typeof(value) === 'object') {
            patch(orig[key], value);
          }
          else {
            orig[key] = value;
          }
        }
        else {
          orig[key] = value;
        }
      }
    }
  );
};

export class SoftPauer extends Service {

  constructor(...args) {
    super(...args);

    this._state = {};
    this._clock = {};
    this._messages = {};
    this._handlePacket = this._handlePacket.bind(this);
    this._raceControlTimestamp = Date.now();
  }

  _handlePacket(pkt) {

    if (pkt.M) {
      pkt.M.forEach(
        m => this._handleMessage(...m.A)
      );
    }

    if (pkt.R) {
      Object.entries(pkt.R).forEach(
        ([key, value]) => {
          this._handleMessage(key, value);
        }
      );
    }

  }

  _handleMessage(msgType, data) {
    switch(msgType) {

      case 'SPFeed':
        patch(this._state, data);
        break;

      case 'ExtrapolatedClock':
        patch(this._clock, data);
        break;

      case 'RaceControlMessages':
        patch(this._messages, data);
        break;

      default:
        break;

    }

    this.onManifestChange(getManifest(this._state));

    const newState = translate(this._state, this._clock);

    const oldTimestamp = this._raceControlTimestamp;

    const newMessages = (this._messages.Messages || []).filter(
      m => new Date(m.Utc).getTime() > oldTimestamp
    ).reverse();

    if (newMessages.length > 0) {
      this._raceControlTimestamp = Math.max(
        ...newMessages.map(
          m => new Date(m.Utc).getTime()
        )
      );
    }

    this.onStateChange({
      ...newState,
      extraMessages: newMessages.map(m => new RaceControlMessage(m.Message, new Date(m.Utc).getTime()).toCTDFormat())
    });
  }

  start(connectionService) {
    createSignalRConnection(
      connectionService,
      HOST,
      'signalr',
      'streaming',
      '1.5',
      this.service.uuid
    ).then(
      socket => {
        this._socket = socket;

        socket.on(
          'open',
          () => {
            console.log("Connected to upstream"); // eslint-disable-line no-console
            socket.send('{"H":"streaming","M":"Subscribe","A":[["SPFeed","ExtrapolatedClock","RaceControlMessages"]],"I":0}');
          }
        );

        socket.on(
          'message',
          (rawMsg) => {
            if (rawMsg.data) {
              this._handlePacket(
                JSON.parse(rawMsg.data)
              );
            }
            else {
              this._handlePacket(
                JSON.parse(rawMsg.toString())
              );
            }
          }
        );

      }
    );
  }

  stop() {
    this._socket && this._socket.close();
  }

}

SoftPauer.regex = new RegExp(HOST.replace('livetiming', '[^.]*'));
SoftPauer.private = true;
