import { FlagState, Stat } from "../../../racing";
import { RaceControlMessage } from '../../messages/Message';
import { ReferenceData } from "./reference";

const CATEGORIES = {
  2: 'LMGTEPro',
  3: 'LMP2',
  4: 'LMGTEAm',
  6: 'LMP3',
  10: 'GTE',
  16: 'GT3',
  18: 'INV',
  4169: 'Hypercar'
};

const CAR_STATES = {
  'Run': 'RUN',
  'In': 'PIT',
  'Out': 'OUT',
  'Stop': 'STOP'
};

const FLAGS = {
  'green': FlagState.GREEN,
  'red': FlagState.RED,
  'yellow': FlagState.YELLOW,
  'full_yellow': FlagState.FCY,
  'safety_car': FlagState.SC,
  'chk': FlagState.CHEQUERED,
  'off': FlagState.NONE
};

const postprocessCars = (cars) => {

  if (cars.length >= 1) {
    // Fix data showing gap and int for leading car!
    cars[0][8] = '';
    cars[0][9] = '';

    const bestLapsByClass = {};
    const classIdx = 2;
    const lastLapIdx = 16;
    const bestLapIdx = 17;

    const bestSectorsByClass = {};

    cars.forEach(
      (car, idx) => {
        const clazz = car[classIdx];
        const blt = car[bestLapIdx][0];
        if (blt > 0 && (!bestLapsByClass[clazz] || bestLapsByClass[clazz][1] > blt)) {
          bestLapsByClass[clazz] = [idx, blt];
        }

        if (!bestSectorsByClass[clazz]) {
          bestSectorsByClass[clazz] = {};
        }

        [1, 2, 3].forEach(
          sector => {
            const st = car[9 + (2 * sector)][0];
            if (st > 0 && (!bestSectorsByClass[clazz][sector] || bestSectorsByClass[clazz][sector][1] > st)) {
              bestSectorsByClass[clazz][sector] = [idx, st];
            }
          }
        );
      }
    );

    Object.values(bestLapsByClass).forEach(
      ([idx, blt]) => {
        const llt = cars[idx][lastLapIdx][0];
        cars[idx][bestLapIdx] = [blt, 'sb'];

        const s3 = cars[idx][15];
        if (llt === blt && !!s3[0]) {
          cars[idx][lastLapIdx] = [llt, 'sb-new'];
        }
      }
    );

    Object.values(bestSectorsByClass).forEach(
      bestSectors => {
        [1, 2, 3].forEach(
          sector => {
            if (bestSectors[sector]) {
              const sectorIdx = 9 + (2 * sector);
              const [idx, st] = bestSectors[sector];
              cars[idx][sectorIdx] = [st, 'sb'];

              if (cars[idx][sectorIdx - 1][1] === 'pb') {
                // Unfortunately current sector time is a string, so we can't
                // compare it without parsing it. But if the time was a personal
                // best we know we're correct in doing this:
                cars[idx][sectorIdx - 1] = [st, 'sb'];
              }
            }
          }
        );
      }
    );
  }

  return cars;
};

export class Client {

  constructor(host, name, onUpdate, updateManifest, fetchFunc) {
    this.entries = {};
    this.params = {};
    this.race_control = [];
    this._prev_race_control_idx = 0;
    this.name = name;
    this.onUpdate = () => onUpdate(this);
    this.updateManifest = updateManifest;
    this.handle = this.handle.bind(this);
    this.getManifest = this.getManifest.bind(this);
    this.getState = this.getState.bind(this);
    this.mapCar = this.mapCar.bind(this);
    this._load_ref_data = this._load_ref_data.bind(this);

    this.reference = new ReferenceData(host, fetchFunc);
    this._load_ref_data();

    updateManifest(this.getManifest());
  }

  _load_ref_data() {
    this.reference.load().then(
      (d) => this.handle('reference_data', d)
    ).catch(
      () => {
        setTimeout(this._load_ref_data, 30000);
      }
    );
  }

  handle(event, data) {
    switch(event) {

      case 'race':
        this.handle('params', data.params);
        this.handle('entries', data.entries);
        break;

      case 'entries':
        data.forEach(
          entry => {
            if (entry) {
              this.entries[entry.id] = entry;
            }
          }
        );
        break;

      case 'params':
        if (!!data.sessionId) {
          const newManifest = data.sessionId !== this.params.sessionId || data.sessionName !== this.params.sessionName;
          this.params = {
            ...this.params,
            ...data
          };
          if (newManifest) {
            this.updateManifest(this.getManifest());
          }
        }
        break;

      case 'race_control':
        this.race_control = [...data];
        break;

      case 'laps':
      case 'stints':
      case 'flags':
      case 'race_light':
      case 'best_sectors':
        // Ignore these (for now)
        break;

      case 'reference_data':
        this.updateManifest(this.getManifest());
        break;

      default:
        console.warn(`Unhandled event: ${event}`, data); // eslint-disable-line no-console

    }

    this.onUpdate();
  }

  getManifest() {

    const description = (this.reference.data.race) ?
      `${this.reference.data.race.name_en} - ${ this.params.sessionName }` :
      this.params.sessionName || 'No current session';

    return {
      name: this.name,
      description,
      colSpec: [
        Stat.NUM,
        Stat.STATE,
        Stat.CLASS,
        Stat.POS_IN_CLASS,
        Stat.TEAM,
        Stat.DRIVER,
        Stat.CAR,
        Stat.LAPS,
        Stat.GAP, // 8
        Stat.INT, // 9
        Stat.S1,
        Stat.BS1,
        Stat.S2,
        Stat.BS2,
        Stat.S3,
        Stat.BS3,
        Stat.LAST_LAP,
        Stat.BEST_LAP,
        Stat.SPEED,
        Stat.PITS
      ],
      trackDataSpec: [
        'Track temp',
        'Air temp',
        'Humidity',
        'Pressure',
        'Wind speed',
        'Wind direction'
      ]
    };
  }

  /*
    Upstream expects the state returned from this call to include only _new_ messages
    in the `extraMessages` array. Feels wrong that two consecutive calls to `getState`
    would return different results, so it's up to the caller to remember where in the
    array we were last time they called.
  */
  getState(prevRaceControlIdx=0) {
    const sortedEntries = Object.values(this.entries).sort((a, b) => a.ranking - b.ranking);

    const newRCMessages = this.race_control.slice(prevRaceControlIdx).reverse();

    const extraMessages = newRCMessages.map(
      msg => new RaceControlMessage(msg.text, msg.dayTime).toCTDFormat()
    );

    return {
      cars: postprocessCars(sortedEntries.map(this.mapCar)),
      extraMessages,
      meta: {
        raceControlIndex: this.race_control.length
      },
      session: {
        timeElapsed: this.params.elapsedTime,
        timeRemain: Math.ceil(Math.max(this.params.remaining, 0)),
        flagState: FLAGS[this.params.raceState?.toLowerCase()] || FlagState.NONE,
        pauseClocks: this.params.stoppedSinceTime > 0,
        trackData: [
          `${this.params.trackTemp?.toFixed(1) || '-'}°C`,
          `${this.params.airTemp?.toFixed(1) || '-'}°C`,
          `${this.params.humidity?.toFixed(0) || '-'}%`,
          `${this.params.pressure?.toFixed(1) || '-'}mbar`,
          `${this.params.windSpeed?.toFixed(1) || '-'}kph`,
          `${this.params.windDirection?.toFixed(0) || '-'}°`,
        ]
      }
    };
  }

  mapCar(car) {

    const llFlag = (car.lastlapTime > 0 && car.lastlapTime === car.bestlapTime) ? 'pb' : '';

    let driver = car.driver;

    if (car.driverId && car.driverId <= car.drivers.length) {
      const drv = car.drivers[car.driverId - 1];
      if (drv) {
        driver = `${drv.lastName}, ${drv.firstName}`;
      }
    }

    const carId = car.id;
    const entry = (this.reference.data.entries || []).find(c => c.id === carId);

    const category = entry?.category_label?.replace('LM ', 'LM') || CATEGORIES[car.categoryId];

    return ([
      car.number,
      CAR_STATES[car.state] || car.state,
      category,
      car.categoryRanking,
      car.team,
      driver,
      car.car,
      car.lap,
      car.gap !== "0.000" ? car.gap : '',
      car.gapPrev !== "0.000" ? car.gapPrev : '',
      [car.currentSector1 !== null ? car.currentSector1 : '', car.currentSector1 === car.bestSector1 ? 'pb' : ''],
      [car.bestTimeSector1 > 0 ? car.bestTimeSector1 / 1000 : '', 'old'],
      [car.currentSector2 !== null ? car.currentSector2 : '', car.currentSector2 === car.bestSector2 ? 'pb' : ''],
      [car.bestTimeSector2 > 0 ? car.bestTimeSector2 / 1000 : '', 'old'],
      [car.currentSector3 !== null ? car.currentSector3 : '', car.currentSector3 === car.bestSector3 ? 'pb' : ''],
      [car.bestTimeSector3 > 0 ? car.bestTimeSector3 / 1000 : '', 'old'],
      [car.lastlapTime > 0 ? car.lastlapTime / 1000 : '', llFlag],
      [car.bestlapTime > 0 ? car.bestlapTime / 1000 : '', ''],
      car.speed !== '-' ? car.speed : '',
      car.pitstop
    ]);
  }

}
