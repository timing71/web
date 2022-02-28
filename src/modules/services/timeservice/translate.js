import dayjs from 'dayjs';

import { FlagState, Stat } from '../../../racing';
import { realToServerTime } from './utils';

import CustomParseFormat from 'dayjs/plugin/customParseFormat';
import { Message, RaceControlMessage } from '../../messages/Message';
dayjs.extend(CustomParseFormat);

const ident = a => a;

const CAR_STATE_MAP = {
  "0": "RUN",
  "1": "RUN",
  "2": "RUN",
  "3": "RUN",
  "4": "FIN",
  "5": "PIT",
  "6": "N/S",
  "8": "?",
  "11": "OUT",
  "12": "FUEL"
};

const FLAG_MAP = {
  [-1]: FlagState.NONE,  // Not started
  1: FlagState.NONE,  // Ready to start
  2: FlagState.RED,
  3: FlagState.SC,
  4: FlagState.CODE_60,
  5: FlagState.CHEQUERED,
  6: FlagState.GREEN,
  7: FlagState.FCY
};

const mapState = (s) => {
  return CAR_STATE_MAP[s] || s;
};

const POSSIBLE_TIME_FORMATS = [
  'm:ss.SSS',
  'sSSS',
  's.SSS',
];

const MAX_INT = 2147483647;
const MAX_INT64_STRING = "9223372036854775807";

const parseTime = (t) => {
  if (t === MAX_INT64_STRING || t === '' || t === MAX_INT || !t) {
    return '';
  }
  try {
    const d =  dayjs(t, POSSIBLE_TIME_FORMATS);

    return (d - d.startOf('hour')).valueOf() / 1000;
  }
  catch {
    return t;
  }
};

const nonnegative = (v) => {
  try {
    return Math.max(0, parseInt(v, 10));
  }
  catch {
    return v;
  }
};

const TIME_FLAG_MAP = {
  '65280': 'pb',
  '16736511': 'sb'
};

const mapSector = (sector) => {
  if (sector === MAX_INT64_STRING) {
    return ['', ''];
  }
  if (sector && sector.length === 2) {
    return [parseInt(sector[0], 10) / 1000000, TIME_FLAG_MAP[sector[1]] || ''];
  }
  return [parseInt(sector, 10) / 1000000, ''];
};

const mapLaptime = (i) => {
  if (i && i[0] !== MAX_INT64_STRING) {
    return [parseInt(i[0], 10) / 1000000, TIME_FLAG_MAP[i[1]] || ''];
  }
  return ['', ''];
};

const parseGap = (i) => {
  if (i && i[0] === '-') {
    return i;
  }
  return parseTime(i);
};

const first = i => i && i[0];

const DEFAULT_COLUMN_SPEC = [
  [Stat.NUM, "startnumber", ident],
  [Stat.STATE, "marker", mapState],
  [Stat.CLASS, "class", v => Array.isArray(v) ? v[0] : v],
  [Stat.POS_IN_CLASS, "position_in_class", first],
  [Stat.TEAM, "team name", ident],
  [Stat.DRIVER, "currentdriver", ident],
  [Stat.DRIVER, "name", ident],
  [Stat.TEAM, "name", ident],
  [Stat.CAR, "car", ident],
  [Stat.LAPS, "laps", v => nonnegative(Array.isArray(v) ? v[0] : v)],
  [Stat.LAPS, "hole", parseGap],
  [Stat.GAP, "hole", parseGap],
  [Stat.INT, "diff", parseGap],
  [Stat.S1, "sectortimes1", mapSector],
  [Stat.S2, "sectortimes2", mapSector],
  [Stat.S3, "sectortimes3", mapSector],
  [Stat.S4, "sectortimes4", mapSector],
  [Stat.S5, "sectortimes5", mapSector],
  [Stat.LAST_LAP, "lastroundtime", mapLaptime],
  [Stat.BEST_LAP, "fastestroundtime", i => mapLaptime([i, null])],
  [Stat.PITS, "pitstops", ident]
];

const deriveColSpec = (columns) => {

  const spec = [];
  const reverseMap = [];
  let inferPosition = true;

  const availableCols = columns.map(c => `${c.n.toLowerCase().trim()}${c.p}`);

  const usedLabels = [];

  DEFAULT_COLUMN_SPEC.forEach(
    ([stat, label, mappingFunc]) => {
      const tsnlIndex = availableCols.indexOf(label);
      if (tsnlIndex >= 0 && !spec.includes(stat) && (!usedLabels.includes(label) || label === 'hole')) {
        // 'hole' (gap) is special-cased as we use it twice in the DEFAULT_COLUMN_SPEC - once as gap,
        // and once to derive laps
        spec.push(stat);
        usedLabels.push(label);
        reverseMap.push([tsnlIndex, mappingFunc]);
      }
    }
  );

  if (availableCols.includes('position')) {
    reverseMap.push([availableCols.indexOf('position'), a => parseInt(a, 10)]);
    inferPosition = false;
  }

  return [spec, reverseMap, inferPosition];
};

const mapSession = (messages, session, times, timeOffset) => {

  const flagFromSession = FLAG_MAP[session.flag];

  const hasLocalYellows = messages.findIndex(m => (m.t || '').toLowerCase().startsWith('yellow flag')) >= 0;

  const retVal = {
    flagState: flagFromSession === FlagState.GREEN && hasLocalYellows ? FlagState.YELLOW : flagFromSession || FlagState.NONE
  };

  if (typeof(times.lt) !== 'undefined' && typeof(times.r) !== 'undefined' && typeof(times.q) !== 'undefined' && !!timeOffset) {
    if ((times.s || 0) === 0 && (times.e || 0) !== 0) {
      retVal['timeRemain'] = ((times.e || 0) - (times.s || 0)) / 1000000;
      retVal['pauseClocks'] = true;
    }
    else if (!!times.h) {
      retVal['pauseClocks'] = true;
      retVal['timeRemain'] = ((times.lt || 0) - (times.r || 0)) / 1000000;
    }
    else {
      const serverNow = realToServerTime(Date.now() / 1000 + timeOffset);
      const elapsed = serverNow - (times.q || 0) + (times.r || 0);
      retVal['timeElapsed'] = Math.ceil(elapsed / 1000000);
      retVal['timeRemain'] = Math.ceil(((times.lt || 0) - elapsed) / 1000000);
    }
  }

  return retVal;
};

const postprocessCars = (cars, columnSpec) => {

  const lapIdx = columnSpec.indexOf(Stat.LAPS);
  const gapIdx = columnSpec.indexOf(Stat.GAP);
  if (lapIdx >= 0) {
    let lastSeenLap = null;
    let leaderLap = null;
    cars.forEach(
      car => {
        const laps = car[lapIdx];
        if (laps[0] === '-') {
          lastSeenLap = parseInt(laps.slice(3), 10);
        }
        if (lastSeenLap !== null) {
          car[lapIdx] = lastSeenLap;
        }
        if (gapIdx >= 0) {
          const gap = car[gapIdx];
          if (gap[0] === '-') {
            if (leaderLap) {
              const delta = leaderLap - lastSeenLap;
              car[gapIdx] = `${delta} lap${delta === 1 ? '' : 's'}`;
            }
            else {
              leaderLap = lastSeenLap;
              car[gapIdx] = '';
            }
          }

        }
      }
    );
  }

  const lastIdx = columnSpec.indexOf(Stat.LAST_LAP);
  const bestIdx = columnSpec.indexOf(Stat.BEST_LAP);
  const classIdx = columnSpec.indexOf(Stat.CLASS);

  if (lastIdx >= 0 && bestIdx >= 0) {
    const bestLapsByClass = {};

    cars.forEach(
      (car, idx) => {
        const bl = car[bestIdx];

        const clazz = classIdx >= 0 ? car[classIdx] : null;

        if (!bestLapsByClass[clazz] || (bl[0] > 0 && bestLapsByClass[clazz].time > bl[0])) {
          bestLapsByClass[clazz] = {
            time: bl[0],
            index: idx
          };
        }
      }
    );

    const s3Idx = columnSpec.indexOf(Stat.S3);

    Object.values(bestLapsByClass).forEach(
      ({ time, index }) => {
        cars[index][bestIdx] = [time, 'sb'];
        if (cars[index][lastIdx][0] === time) {
          if (s3Idx === -1 || !!cars[index][s3Idx][0]) {
            cars[index][lastIdx] = [time, 'sb-new'];
          }
          else {
            cars[index][lastIdx] = [time, 'sb'];
          }
        }
      }
    );
  }


  return cars;
};

const getManifest = (state) => {
  const { columns, meta, session } = state;

  const [colSpec] = deriveColSpec(columns);

  const descParts = [];
  if (meta?.name) {
    descParts.push(meta.name);
  }
  if (session?.name && session.name.lastIndexOf('-') >= 0) {
    descParts.push(session.name.slice(session.name.lastIndexOf('-') + 1));
  }

  return {
    name: (session.name && session.name.slice(0, session.name.lastIndexOf('-') - 1)) || '',
    description: descParts.join(' - '),
    colSpec
  };
};

const translateState = (state) => {
  const { cars, columns, messages, prevMessageIDs, penaltyUpdates, session, times, timeOffset } = state;
  const [colSpec, reverseColumnMap, inferPosition] = deriveColSpec(columns);

  const positionSort = (a, b) => {
    if (inferPosition) {
      return 0;
    }
    const [[tsnlIndex, mappingFunc]] = reverseColumnMap.slice(-1);
    return mappingFunc(a[tsnlIndex]) - mappingFunc(b[tsnlIndex]);
  };

  const raceControlMessages = messages.filter(m => !prevMessageIDs.includes(m.Id)).map(m => new RaceControlMessage(m.t).toCTDFormat());
  const penaltyUpdateMessages = penaltyUpdates.map(
    p => new Message(
      'Penalty',
      `Car ${p.raceNum}: ${p.incident} - ${p.value}: ${p.state} (decision ${p.decisionID})`.toUpperCase(),
      'raceControl',
      p.raceNum
    ).toCTDFormat()
  );

  return {
    cars: postprocessCars(
      Object.values(cars).sort(positionSort).map(
        car => reverseColumnMap.map(
          ([tsnlIndex, mappingFunc]) => mappingFunc(car[tsnlIndex])
        )
      ),
      colSpec
    ),
    session: mapSession(messages, session, times, timeOffset),
    extraMessages: raceControlMessages.concat(penaltyUpdateMessages)
  };

};

export const translate = (state) => {
  return {
    manifest: getManifest(state),
    state: translateState(state)
  };
};
