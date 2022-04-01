import { Service } from '../service';
import { Message } from '../../messages';

export class Natsoft extends Service {

  constructor(...args) {
    super(...args);

    this._socket = null;

    this._handlePacket = this._handlePacket.bind(this);
  }

  start(connectionService) {

    const wsURL = this.service.source.replace(/^t71 Natsoft:\/\//, '').replace(/^https?:/, 'ws:');

    this._parser = connectionService.createDOMParser();

    this._socket = connectionService.createWebsocket(
      wsURL,
      {
        autoReconnect: false,
        tag: this.service.uuid
      }
    );
    this._socket.onmessage = (m) => {
      if (m.data) {
        this._handlePacket(m.data);
      }
      else if (typeof(m.toString) === 'function') {
        this._handlePacket(m.toString());
      }
    };

  }

  _handlePacket(p) {
    if (p.slice(0, 12) === '<NotFound />') {
      this.onStateChange({
        extraMessages: [
          new Message(
            'System',
            'No timing available. Please try again later.',
            'system'
          ).toCTDFormat()
        ]
      });
    }

    const xmlPart = p.slice(p.indexOf('<'));

    const data = this._parser.parseFromString(xmlPart, 'application/xml');

    const tagName = data.documentElement.nodeName.toLowerCase();

    const funcName = `_handle_${tagName}`;
    if (typeof(this[funcName]) === 'function') {
      this[funcName](data.documentElement);
    }
    else {
      console.warn('Unhandled packet: ', p); // eslint-disable-line no-console
    }
  }

  stop() {

  }

}

Natsoft.regex = /\/LiveMeeting\//; // Ick, this is a bit tentative...
