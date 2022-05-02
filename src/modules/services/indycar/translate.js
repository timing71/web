import { FlagState, Stat } from "../../../racing";
import { parseTime } from "../utils";

const mapCarState = (car) => {
  if (car.status.toLowerCase() === 'in pit' || !car.onTrack) {
    return 'PIT';
  }
  return 'RUN';
};

const TYRE_MAP = {
  'P': ["P", "tyre-medium"],
  'A': ["O", "tyre-soft"],
  'W': ["W", "tyre-wet"],
  'WX': ["W", "tyre-wet"]
};

const FLAG_MAP = {
  GREEN: FlagState.GREEN,
  YELLOW: FlagState.CAUTION,
  RED: FlagState.RED,
  CHECKERED: FlagState.CHEQUERED,
  WHITE: FlagState.WHITE,
  COLD: FlagState.NONE
};

const parseEventName = (heartbeat) => {
  const parts = [];

  if (heartbeat.eventName) {
    parts.push(heartbeat.eventName);
  }

  if (heartbeat.preamble) {
    switch(heartbeat.preamble[0]) {
      case 'R':
        parts.push('Race');
        break;

      case 'P':
        if (heartbeat.preamble[1].toUpperCase() === 'F') {
          parts.push('Final Practice');
        }
        else {
          parts.push(`Practice ${heartbeat.preamble[1]}`);
        }
        break;

      case 'Q':
        parts.push('Qualifying');

        if (heartbeat.trackType !== 'I' && heartbeat.trackType !== 'O') {
          if (heartbeat.preamble[1] === '3') {
            parts.push('Round 2');
          }
          else if (heartbeat.preamble[1] === '4') {
            parts.push('Firestone Fast Six');
          }
          else {
            parts.push(`Group ${heartbeat.preamble[1]}`);
          }
        }
      break;

      case 'I':
        parts.push('Qualifying');
        if (heartbeat.preamble[1] === '4') {
          parts.push('Fast 9');
        }
        break;

      default:
    }
  }

  return parts.join(' - ');
};

export const getManifest = ({ timing_results: { heartbeat } }) => {
  const isOval = heartbeat.trackType === 'O' || heartbeat.trackType === 'I';

  const ptpCol = isOval ? [] : [Stat.PUSH_TO_PASS];
  const sectorCols = isOval ?
    [
      Stat.T1_SPEED,
      Stat.BEST_T1_SPEED,
      Stat.T3_SPEED,
      Stat.BEST_T3_SPEED
    ]
    : [
      Stat.S1,
      Stat.BS1,
      Stat.S2,
      Stat.BS2,
      Stat.S3,
      Stat.BS3
    ];

  return {
    name: 'IndyCar',
    description: parseEventName(heartbeat),
    colSpec: [
      Stat.NUM,
      Stat.STATE,
      Stat.DRIVER,
      Stat.TEAM,
      Stat.LAPS,
      Stat.TYRE
    ].concat(ptpCol).concat([
      Stat.GAP,
      Stat.INT,
    ]).concat(sectorCols).concat([
      Stat.LAST_LAP,
      Stat.BEST_LAP,
      Stat.PITS
    ])
  };
};

export const translate = (rawData) => {

  const { timing_results: { heartbeat, Item } } = rawData;

  const isOval = heartbeat.trackType === 'O' || heartbeat.trackType === 'I';

  const cars = [];

  const bestLap = {
    index: -1,
    time: null
  };

  Item.forEach(
    c => {

      let ptpCol = [];

      if (!isOval) {
        ptpCol = [[c["OverTake_Remain"], c["OverTake_Active"] === 1 ? "ptp-active" : ""]];
      }

      let sectorCols = [];

      if (!isOval) {
        const s1 = c['I1'];
        const bs1 = c['Best_I1'];
        const s2 = c['I2'];
        const bs2 = c['Best_I2'];
        const s3 = c['I3'];
        const bs3 = c['Best_I3'];

        sectorCols = [
          [s1, s1 === bs1 ? 'pb' : ''],
          [bs1, 'old'],
          [s2, s2 === bs2 ? 'pb' : ''],
          [bs2, 'old'],
          [s3, s3 === bs3 ? 'pb' : ''],
          [bs3, 'old'],
        ];

      }

      const lastLapTime = parseTime(c['lastLapTime']);
      const bestLapTime = parseTime(c['bestLapTime']);

      if (bestLapTime && (!bestLap.time || bestLap.time > bestLapTime)) {
        bestLap.time = bestLapTime;
        bestLap.index = cars.length;
      }

      cars.push([
        c['no'],
        mapCarState(c),
        `${c['firstName']} ${c['lastName']}`,
        c['team'],
        c['laps'],
        TYRE_MAP[c['Tire']] || c['Tire']
      ].concat(ptpCol).concat([
        cars.length > 0 && (c.diff || '').slice(0, 5) !== '0.000' ? c['diff'] : '',
        cars.length > 0 && (c.gap || '').slice(0, 5) !== '0.000'? c['gap'] : ''
      ]).concat(sectorCols).concat([
        lastLapTime > 0 ? [lastLapTime, lastLapTime === bestLapTime ? 'pb' : ''] : ['', ''],
        [bestLapTime > 0 ? bestLapTime : '', ''],
        c['pitStops']
      ]));
    }
  );

  if (bestLap.index >= 0) {
    const bestCar = cars[bestLap.index];

    const bcbl = bestCar[bestCar.length - 2];
    const bcll = bestCar[bestCar.length - 3];

    if (bcbl[0] === bcll[0]) {
      bestCar[bestCar.length - 2][1] = 'sb-new';
    }
    else {
      bestCar[bestCar.length - 2][1] = 'sb';
    }
  }

  const session = {
    flagState: FLAG_MAP[heartbeat.currentFlag] || FlagState.NONE,
    timeElapsed: parseTime(heartbeat.elapsedTime)
  };

  if (heartbeat.overallTimeToGo) {
    session['timeRemain'] = parseTime(heartbeat.overallTimeToGo);
  }

  if (heartbeat.totalLaps && heartbeat.trackType !== 'I' && heartbeat.SessionType !== 'Q') {
    session['lapsRemain'] = parseInt(heartbeat.totalLaps, 10) - parseInt(heartbeat.lapNumber, 10);
  }

  return {
    cars,
    session
  };
};
