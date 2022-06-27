import { FlagState, Stat } from '@timing71/common';
import { Message, RaceControlMessage } from '../../messages';

export class RedirectError extends Error {
  constructor(url) {
    super('You have been redirected');
    this.name = 'RedirectError';
    this.url = url;
  }
}

const COLUMN_SPEC = [
  Stat.NUM,
  Stat.STATE,
  Stat.CLASS,
  Stat.DRIVER,
  Stat.TEAM,
  Stat.CAR,
  Stat.LAPS,
  Stat.TYRE,
  Stat.GAP,
  Stat.INT,
  Stat.S1,
  Stat.BS1,
  Stat.S2,
  Stat.BS2,
  Stat.S3,
  Stat.BS3,
  Stat.LAST_LAP,
  Stat.BEST_LAP,
  Stat.PITS
];

const FLAG_MAP = {
  'Yellow': FlagState.SC,
  'Green': FlagState.GREEN,
  'Red': FlagState.RED,
  'Checkered': FlagState.CHEQUERED,
  'Ended': FlagState.CHEQUERED,
  'WaitStart': FlagState.NONE
};

const CAR_STATE_MAP = {
  'P': 'PIT',
  'T': 'OUT',
  '': 'RUN'
};

const TYRE_MAP = {
  'H': ['H', 'tyre-hard'],
  'M': ['M', 'tyre-med'],
  'S': ['S', 'tyre-soft'],
  'SS': ['SS', 'tyre-ssoft'],
  'I': ['I', 'tyre-inter'],
  'W': ['W', 'tyre-wet']
};

const formatGap = (laps, time) => {
  const maybeLaps = parseFloat(laps);
  if (isNaN(maybeLaps)) {
    return time;
  }
  if (maybeLaps === 1) {
    return '1 lap';
  }
  else if (maybeLaps > 1) {
    return `${Math.floor(maybeLaps)} laps`;
  }
  else if (parseFloat(time) > 0) {
    return time;
  }
  return '';
};

export class Client {

  constructor(parser, onStateChange, onManifestChange) {

    this._parser = parser;
    this.onStateChange = onStateChange;
    this.onManifestChange = onManifestChange;

    this.handlePacket = this.handlePacket.bind(this);
    this.reset = this.reset.bind(this);
    this.getManifest = this.getManifest.bind(this);
    this.getState = this.getState.bind(this);
    this.mapCar = this.mapCar.bind(this);

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
  }

  handlePacket(p) {
    const xmlPart = p.slice(p.indexOf('<'));
    const data = this._parser.parseFromString(xmlPart, 'application/xml');
    this._handle_xml(data.documentElement);
    this.onStateChange(this.getState());
  }

  _handle_xml(xml) {
    const tagName = xml.nodeName.toLowerCase();

    const funcName = `_handle_${tagName}`;
    if (typeof(this[funcName]) === 'function') {
      this[funcName](xml);
    }
    else {
      console.warn('Unhandled packet: ', xml.nodeName, xml); // eslint-disable-line no-console
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
          'No timing available. Refresh the page to try again later.',
          'system'
        ).toCTDFormat()
      ],
      manifest: this.getManifest()
    });
  }

  _handle_redirect(redir) {
    const newSource = redir.getAttribute('URL');
    throw new RedirectError(newSource);
  }

  _handle_new(data) {
    let isActualReset = false;

    const eventNode = data.querySelector('E');
    if (!!eventNode) {
      const description = eventNode.getAttribute('D');
      isActualReset = description !== this._description;
      this._description = description;

      if (isActualReset) {
        this.reset();
      }

      this._handle_children(data);

      if (isActualReset) {
        this.onManifestChange(this.getManifest());
      }
    }
  }

  _handle_a(fastest) {
    this._session.sb = [
      parseFloat(fastest.getAttribute('I')),
      parseFloat(fastest.getAttribute('S1')),
      parseFloat(fastest.getAttribute('S2')),
      parseFloat(fastest.getAttribute('S3')),
    ];
  }

  _handle_c(counters) {
    this._session.elapsed = parseInt(counters.getAttribute('E'), 10);
    this._session.timeUpdated = Date.now();
    this._session.counter = [
      parseInt(counters.getAttribute('C') || 0, 10),
      counters.getAttribute('Y')
    ];
  }

  _handle_f(flag) {
    // These things are ultimately the same for our purposes
    this._handle_s(flag);
  }

  _handle_g(messages) {
    const msgs = [];

    const r = messages.getAttribute('R');
    if (r) {
      msgs.push(new RaceControlMessage(r));
    }

    const c = messages.getAttribute('C');
    if (c) {
      msgs.push(new RaceControlMessage(c));
    }

    if (msgs.length > 0) {
      this.onStateChange({
        extraMessages: msgs.map(m => m.toCTDFormat())
      });
    }
  }

  _handle_h() { /* Ignore */ }

  _handle_l(l) {
    this._handle_children(l);
  }

  _handle_m(meeting) {
    this._name = meeting.getAttribute('D');
  }

  _handle_os(os) {
    this._handle_children(os);
  }

  _handle_e(event) {
    this._description = event.getAttribute('D');
  }

  _handle_o(category) {
    this._categories[category.getAttribute('ID')] = category.getAttribute('C');
  }

  _handle_ol() { /* Ignore */ }

  _handle_p(position) {
    const compID = position.getAttribute('C');
    const competitor = this._competitors[compID];

    const detail = position.querySelector('D');

    const prevData = this._positions[compID]?.data || {};

    const newState = detail.getAttribute('PF');

    const data = {
      tyre: detail.getAttribute('TY') || prevData.tyre,
      laps: detail.getAttribute('L') || prevData.laps,
      s1: detail.getAttribute('S1') || prevData.s1,
      s2: detail.getAttribute('S2') || prevData.s2,
      s3: detail.getAttribute('S3') || prevData.s3,
      bs1: detail.getAttribute('FS1') || prevData.bs1,
      bs2: detail.getAttribute('FS2') || prevData.bs2,
      bs3: detail.getAttribute('FS3') || prevData.bs3,
      last: detail.getAttribute('I') || prevData.last,
      best: detail.getAttribute('FI') || prevData.best,

      gapLaps: detail.getAttribute('LGL') || prevData.gapLaps || 0,
      intLaps: detail.getAttribute('LGNL') || prevData.intLaps || 0,
      gapTime: detail.getAttribute('LGI') || prevData.gapTime || 0,
      intTime: detail.getAttribute('LGNI') || prevData.intTime || 0,

      pits: parseInt(detail.getAttribute('PS') || 0, 10) || prevData.pits,
      state: newState === '' || !!newState ? newState : prevData.state
    };

    this._positions[compID] = {
      competitor,
      driver: competitor.drivers[position.getAttribute('D')],
      data,
      position: parseInt(position.getAttribute('LP'))
    };

  }

  _handle_r(competitor) {
    const cat = competitor.getAttribute('S');

    const drivers = {};

    const driverElems = competitor.querySelectorAll('V');

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

  _handle_rl(rl) {
    this._handle_children(rl);
  }

  _handle_s(status) {
    const rawFlag = status.getAttribute('S');
    if (rawFlag) {
      this._session.flag = FLAG_MAP[rawFlag] || FlagState.NONE;
    }
  }

  _handle_t() { /* Ignore */ }

  getManifest() {
    return {
      name: this._name || 'Natsoft',
      description: this._description || 'No timing available',
      colSpec: COLUMN_SPEC
    };
  }

  getState() {

    const delta = (Date.now() - this._session.timeUpdated) / 1000;

    const session = {
      flagState: this._session.flag,
      timeElapsed: this._session.elapsed + delta,
    };

    if (this._session.counter) {
      const [value, countType] = this._session.counter;
      if (countType[0] === 'L') {
        session.lapsRemain = Math.max(0, value);
      }
      else if (countType[0] === 'T') {
        session.timeRemain = Math.max(
          0,
          value - (this._session.flag === FlagState.NONE ? 0 : delta)
        );
      }
    }

    return {
      cars: this.getCars(),
      session
    };
  }

  getCars() {
    return Object.values(this._positions).sort((a, b) => a.position - b.position).map(this.mapCar);
  }

  mapCar(c) {

    const sessionBestSectors = this._session.sb || [0, 0, 0, 0];

    const s1 = c.data?.s1 || 0;
    const bs1 = c.data?.bs1 || 0;
    const s1Flag = s1 === `${sessionBestSectors[1]}` ? 'sb' : s1 === bs1 ? 'pb' : '';
    const bs1Flag = bs1 === `${sessionBestSectors[1]}` ? 'sb' : 'old';
    const s2 = c.data?.s2 || 0;
    const bs2 = c.data?.bs2 || 0;
    const s2Flag = s2 === `${sessionBestSectors[2]}` ? 'sb' : s2 === bs2 ? 'pb' : '';
    const bs2Flag = bs2 === `${sessionBestSectors[2]}` ? 'sb' : 'old';
    const s3 = c.data?.s3 || 0;
    const bs3 = c.data?.bs3 || 0;
    const s3Flag = s3 === `${sessionBestSectors[3]}` ? 'sb' : s3 === bs3 ? 'pb' : '';
    const bs3Flag = bs3 === `${sessionBestSectors[3]}` ? 'sb' : 'old';

    const last = parseFloat(c.data?.last) || 0;
    const best = parseFloat(c.data?.best) || 0;

    const lastFlag = last === sessionBestSectors[0] && s3 > 0 ? 'sb-new' : last === best ? 'pb' : '';
    const bestFlag = best === sessionBestSectors[0] ? 'sb' : '';

    return [
      c.competitor?.number,
      CAR_STATE_MAP[c.data?.state] || '?',
      c.competitor?.category,
      c.driver,
      c.competitor?.name,
      c.competitor?.vehicle,
      c.data?.laps,
      TYRE_MAP[c.data?.tyre] || '',
      formatGap(c.data?.gapLaps || 0, c.data?.gapTime || 0),
      formatGap(c.data?.intLaps || 0, c.data?.intTime || 0),
      s1 > 0 ? [s1, s1Flag] : ['', ''],
      bs1 > 0 ? [bs1, bs1Flag] : ['', ''],
      s2 > 0 ? [s2, s2Flag] : ['', ''],
      bs2 > 0 ? [bs2, bs2Flag] : ['', ''],
      s3 > 0 ? [s3, s3Flag] : ['', ''],
      bs3 > 0 ? [bs3, bs3Flag] : ['', ''],
      last > 0 ? [last, lastFlag] : ['', ''],
      best > 0 ? [best, bestFlag] : ['', ''],
      c.data?.pits || ''
    ];
  }

}
