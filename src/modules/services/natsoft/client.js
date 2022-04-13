import { FlagState } from '../../../racing';
import { Message } from '../../messages';

export class Client {

  constructor(parser, onStateChange, onManifestChange) {

    this._parser = parser;
    this.onStateChange = onStateChange;
    this.onManifestChange = onManifestChange;

    this.handlePacket = this.handlePacket.bind(this);
    this.reset = this.reset.bind(this);
    this.reset();
  }

  reset() {
    this.has_data = false;
    this._categories = {};
    this._positions = {};
    this._session = {
        flag: FlagState.NONE
    };
    this._competitors = {};
    this._name = '';
    this._description = '';
    this.messages = [];
  }

  handlePacket(p) {
    const xmlPart = p.slice(p.indexOf('<'));
    const data = this._parser.parseFromString(xmlPart, 'application/xml');
    this._handle_xml(data.documentElement);
  }

  _handle_xml(xml) {
    const tagName = xml.nodeName.toLowerCase();

    const funcName = `_handle_${tagName}`;
    if (typeof(this[funcName]) === 'function') {
      this[funcName](xml);
    }
    else {
      console.warn('Unhandled packet: ', xml.nodeName); // eslint-disable-line no-console
    }
  }

  _handle_children(xml) {
    for (let i = 0; i < xml.children.length; i++) {
      this._handle_xml(xml.children[i]);
    }
  }

  _handle_notfound() {
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

  _handle_new(data) {
    let isActualReset = false;

    const eventNode = data.querySelector('E');
    if (!!eventNode) {
      const description = eventNode.getAttribute('D');
      isActualReset = description !== this._description;
      this._description = description;

      if (isActualReset) {
        this._reset();
      }

      this._handle_children(data);
    }
  }

  _handle_m(meeting) {
    this._name = meeting.getAttribute('D');
  }

  _handle_e(event) {
    this._description = event.getAttribute('D');
  }

  _handle_o(category) {
    this._categories[category.getAttribute('ID')] = category.getAttribute('C');
  }

  _handle_r(competitor) {
    const cat = competitor.getAttribute('S');

    const drivers = {};

    const driverElems = competitor.querySelector('V');

    for (let i = 0; i < driverElems.length; i++) {
      const de = driverElems[i];
      drivers[de.getAttribute('ID')] = (de.getAttribute('N') || '').replaceAll('_', ' ');
    }

    this._competitors[competitor.getAttribute('ID')] = {
      category: this._categories[cat] || cat,
      name: '',
      number: competitor.getAttribute('N'),
      vehicle: competitor.getAttribute('V'),
      drivers
    };
  }

  _handle_p(position) {
    const competitor = this._competitors[position.getAttribute('C')];

  }

}
