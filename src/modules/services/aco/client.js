import { FlagState, Stat } from "../../../racing";

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

const mapCar = (car) => {

  const llFlag = (car.lastlapTime === car.bestlapTime) ? 'pb' : '';

  let driver = car.driver;

  if (car.driverId && car.driverId <= car.drivers.length) {
    const drv = car.drivers[car.driverId - 1];
    if (drv) {
      driver = `${drv.lastName}, ${drv.firstName}`;
    }
  }


  return ([
    car.number,
    CAR_STATES[car.state] || car.state,
    CATEGORIES[car.categoryId],
    car.categoryRanking,
    car.team,
    driver,
    car.car,
    car.lap,
    car.gap !== "0.000" ? car.gap : '',
    car.gapPrev !== "0.000" ? car.gapPrev : '',
    [car.currentSector1 > 0 ? car.currentSector1 : '', car.currentSector1 === car.bestSector1 ? 'pb' : ''],
    [car.bestSector1 > 0 ? car.bestSector1 : '', 'old'],
    [car.currentSector2 > 0 ? car.currentSector2 : '', car.currentSector2 === car.bestSector2 ? 'pb' : ''],
    [car.bestSector2 > 0 ? car.bestSector2 : '', 'old'],
    [car.currentSector3 > 0 ? car.currentSector3 : '', car.currentSector3 === car.bestSector3 ? 'pb' : ''],
    [car.bestSector3 > 0 ? car.bestSector3 : '', 'old'],
    [car.lastlapTime > 0 ? car.lastlapTime / 1000 : '', llFlag],
    [car.bestlapTime > 0 ? car.bestlapTime / 1000 : '', ''],
    car.speed !== '-' ? car.speed : '',
    car.pitstop
  ]);
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
        if (!bestLapsByClass[clazz] || bestLapsByClass[clazz][1] > blt) {
          bestLapsByClass[clazz] = [idx, blt];
        }

        if (!bestSectorsByClass[clazz]) {
          bestSectorsByClass[clazz] = {};
        }

        [1, 2, 3].forEach(
          sector => {
            const st = car[9 + (2 * sector)][0];
            if (!bestSectorsByClass[clazz][sector] || bestSectorsByClass[clazz][sector][1] > st) {
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
        if (llt === blt) {
          cars[idx][lastLapIdx] = [llt, 'sb-new'];
        }
      }
    );

    Object.values(bestSectorsByClass).forEach(
      bestSectors => {
        [1, 2, 3].forEach(
          sector => {
            const sectorIdx = 9 + (2 * sector);
            const [idx, st] = bestSectors[sector];
            cars[idx][sectorIdx] = [st, 'sb'];

            if (cars[idx][sectorIdx - 1][0] === st) {
              cars[idx][sectorIdx - 1] = [st, 'sb'];
            }
          }
        );
      }
    );
  }

  return cars;
};

export class Client {

  constructor(name, onUpdate, updateManifest) {
    this.entries = {};
    this.params = {};
    this.name = name;
    this.onUpdate = () => onUpdate(this);
    this.updateManifest = updateManifest;
    this.handle = this.handle.bind(this);
    this.getManifest = this.getManifest.bind(this);
    this.getState = this.getState.bind(this);
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

      case 'laps':
      case 'stints':
      case 'flags':
      case 'race_light':
        // Ignore these (for now)
        break;

      default:
        console.warn(`Unhandled event: ${event}`, data); // eslint-disable-line no-console

    }

    this.onUpdate();
  }

  getManifest() {
    return {
      name: this.name,
      description: this.params.sessionName,
      columnSpec: [
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
    ]
    };
  }

  getState() {
    const sortedEntries = Object.values(this.entries).sort((a, b) => a.ranking - b.ranking);
    return {
      cars: postprocessCars(sortedEntries.map(mapCar)),
      session: {
        timeElapsed: this.params.elapsedTime,
        timeRemain: Math.ceil(Math.max(this.params.remaining, 0)),
        flagState: FLAGS[this.params.raceState?.toLowerCase()] || FlagState.NONE,
        pauseClocks: this.params.stoppedSinceTime > 0
      }
    };
  }

}
