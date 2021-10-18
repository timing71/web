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

  return ([
    car.number,
    CAR_STATES[car.state],
    CATEGORIES[car.categoryId],
    car.categoryRanking,
    car.team,
    car.driver,
    car.car,
    car.lap,
    car.gap,
    car.gapPrev,
    car.currentSector1,
    [car.bestSector1, 'old'],
    car.currentSector2,
    [car.bestSector2, 'old'],
    car.currentSector3,
    [car.bestSector3, 'old'],
    [car.lastlapTime / 1000, llFlag],
    [car.bestlapTime / 1000, ''],
    car.speed,
    car.pitstop
  ]);
};

export class Client {

  constructor(name, onUpdate) {
    this.entries = {};
    this.params = {};
    this.name = name;
    this.onUpdate = () => onUpdate(this);
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

      case 'race_light':
      case 'params':
        this.params = {
          ...this.params,
          ...data
        };
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
        Stat.SPEED,
        Stat.PITS
    ]
    };
  }

  getState() {
    const sortedEntries = Object.values(this.entries).sort((a, b) => a.ranking - b.ranking);
    return {
      cars: sortedEntries.map(mapCar),
      session: {
        timeElapsed: this.params.elapsedTime,
        timeRemaining: Math.max(this.params.remaining, 0),
        flagState: FLAGS[this.params.raceState.toLowerCase()] || 'NONE'
      }
    };
  }

}
