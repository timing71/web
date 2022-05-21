import { FlagState, Stat } from "../../../racing";
import { parseTime } from "../utils";

const mapCarState = (car) => {
  if (car.status.toLowerCase() === 'in pit' || car.onTrack === 'False') {
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

const isOval = (heartbeat) => heartbeat.trackType === 'O' || heartbeat.trackType === 'I';

const isIndyQualifying = (heartbeat) => heartbeat.trackType === 'I' && (heartbeat.SessionType || '')[0] === 'Q';

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
        break;

      default:
    }
  }

  return parts.join(' - ');
};

export const getManifest = ({ timing_results: { heartbeat } }) => {
  const oval = isOval(heartbeat);

  const ptpCol = oval ? [] : [Stat.PUSH_TO_PASS];
  const sectorCols = oval ?
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

  const trackDataSpec = isIndyQualifying(heartbeat) ? [
      'Current qualifier',
      'Laps',
      'Lap 1 speed',
      'Lap 2 speed',
      'Lap 3 speed',
      'Lap 4 speed',
      'Average speed',
      'Current rank'
  ] : [];

  const bestCols = isIndyQualifying(heartbeat) ? [
    Stat.AV_SPEED,
    Stat.BEST_LAP
  ] : [Stat.BEST_LAP];

  return {
    name: 'IndyCar',
    description: parseEventName(heartbeat),
    colSpec: [
      Stat.NUM,
      Stat.STATE,
      Stat.DRIVER,
      Stat.TEAM,
      Stat.LAPS,
      Stat.TYRE,
    ...ptpCol,
      Stat.GAP,
      Stat.INT,
    ...sectorCols,
      Stat.LAST_LAP,
      Stat.SPEED,
      ...bestCols,
      Stat.BEST_SPEED,
      Stat.PITS
    ],
    trackDataSpec
  };
};

const parseSpeed = (spd) => {
  try {
    const maybeSpeed = parseFloat(spd);
    if (isNaN(maybeSpeed)) {
      return '';
    }
    return maybeSpeed;
  }
  catch {
    return '';
  }
};

export const translate = (rawData, debouncer) => {

  const { timing_results: { heartbeat, Item } } = rawData;

  const oval = isOval(heartbeat);
  const indyQualifying = isIndyQualifying(heartbeat);

  const cars = [];

  const bestLap = {
    index: -1,
    time: null
  };

  Item.forEach(
    c => {

      let ptpCol = [];

      if (!oval) {
        ptpCol = [[c["OverTake_Remain"], c["OverTake_Active"] === 1 ? "ptp-active" : ""]];
      }

      let sectorCols = [];

      if (oval) {

        const t1 = parseSpeed(c['T1_SPD']);
        const bt1 = parseSpeed(c['Best_T1_SPD']);
        const t3 = parseSpeed(c['T3_SPD']);
        const bt3 = parseSpeed(c['Best_T3_SPD']);

        sectorCols = [
          [t1, ''],
          [bt1, 'old'],
          [t3, ''],
          [bt3, 'old'],
        ];
      }
      else {
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

      const bestCols = [
        [bestLapTime > 0 ? bestLapTime : '', 'old']
      ];

      if (indyQualifying) {
        bestCols.unshift(
          [parseSpeed(c['AverageSpeed']), '']
        );
      }

      const llFlag = lastLapTime === bestLapTime ? 'pb' : '';

      const newState = debouncer.debounce(c['no'], mapCarState(c));

      cars.push([
        c['no'],
        newState,
        `${c['firstName']} ${c['lastName']}`,
        c['team'],
        c['laps'],
        TYRE_MAP[c['Tire']] || c['Tire'],
        ...ptpCol,
        cars.length > 0 && (c.diff || '').slice(0, 5) !== '0.000' && c.diff[0] !== '-' ? c['diff'] : '',
        cars.length > 0 && (c.gap || '').slice(0, 5) !== '0.000' && c.gap[0] !== '-' ? c['gap'] : '',
       ...sectorCols,
        lastLapTime > 0 ? [lastLapTime, llFlag] : ['', ''],
        [parseSpeed(c['LastSpeed']), llFlag],
        ...bestCols,
        [parseSpeed(c['BestSpeed']), 'old'],
        c['pitStops']
      ]);
    }
  );

  if (bestLap.index >= 0) {
    const bestCar = cars[bestLap.index];

    const bcbl = bestCar[bestCar.length - 2];
    const bcll = bestCar[bestCar.length - 4];

    if (bcbl[0] === bcll[0]) {
      bestCar[bestCar.length - 2][1] = 'sb'; // B.SPD
      bestCar[bestCar.length - 3][1] = 'sb'; // BEST
      bestCar[bestCar.length - 4][1] = 'sb'; // SPEED
      bestCar[bestCar.length - 5][1] = 'sb-new'; // LAST
    }
    else {
      bestCar[bestCar.length - 2][1] = 'sb';
      bestCar[bestCar.length - 3][1] = 'sb';
    }
  }

  const session = {
    flagState: heartbeat.currentFlag === 'YELLOW' && (heartbeat.SessionType || '')[0] !== 'R' ? FlagState.YELLOW : FLAG_MAP[heartbeat.currentFlag] || FlagState.NONE,
    timeElapsed: parseTime(heartbeat.elapsedTime)
  };

  if (heartbeat.overallTimeToGo) {
    session['timeRemain'] = parseTime(heartbeat.overallTimeToGo);
  }

  if (heartbeat.totalLaps && heartbeat.trackType !== 'I' && heartbeat.SessionType !== 'Q') {
    session['lapsRemain'] = parseInt(heartbeat.totalLaps, 10) - parseInt(heartbeat.lapNumber, 10);
  }

  if (indyQualifying) {
    const currentQualifier = Item.find(c => c['QStatus'] === 'Qualifying');
    if (currentQualifier) {

      session['trackData'] = [
        `#${currentQualifier['no']} ${currentQualifier['firstName']} ${currentQualifier['lastName']}`,
        currentQualifier['laps'],
        parseSpeed(currentQualifier['lap1QualSpeed']),
        parseSpeed(currentQualifier['lap2QualSpeed']),
        parseSpeed(currentQualifier['lap3QualSpeed']),
        parseSpeed(currentQualifier['lap4QualSpeed']),
        parseSpeed(currentQualifier['AverageSpeed']),
        currentQualifier['rank'],
      ];
    }
  }

  return {
    cars,
    session
  };
};
