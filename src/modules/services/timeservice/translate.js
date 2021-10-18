import dayjs from 'dayjs';
import { useCallback, useEffect, useRef } from 'react';
import { FlagState, Stat } from '../../../racing';
import { realToServerTime } from './utils';

import CustomParseFormat from 'dayjs/plugin/customParseFormat';
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
  's:SSS'
];

const parseTime = (t) => {
  if (t === '9223372036854775807' || t === '') {
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
    return Math.max(0, parseInt(v[0], 10));
  }
  catch {
    return v;
  }
};

const DEFAULT_COLUMN_SPEC = [
  [Stat.NUM, "startnumber", ident],
  [Stat.STATE, "marker", mapState],
  [Stat.CLASS, "class", ident],
  [Stat.POS_IN_CLASS, "position_in_class", ident],
  [Stat.TEAM, "team name", ident],
  [Stat.TEAM, "name", ident],
  [Stat.DRIVER, "currentdriver", ident],
  [Stat.DRIVER, "name", ident],
  [Stat.CAR, "car", ident],
  [Stat.LAPS, "laps", nonnegative],
  //[Stat.GAP, "hole", parse_gap],
  [Stat.INT, "diff", parseTime],
  //[Stat.S1, "sectortimes1", map_sector],
  //[Stat.S2, "sectortimes2", map_sector],
  //[Stat.S3, "sectortimes3", map_sector],
  //[Stat.S4, "sectortimes4", map_sector],
  //[Stat.S5, "sectortimes5", map_sector],
  //[Stat.LAST_LAP, "lastroundtime", i => [parseTime(i[0]), mapTimeFlags(i[1])]],
  //[Stat.BEST_LAP, "fastestroundtime", i => [parseTime(i[0]), mapTimeFlags(i[1])]],
  [Stat.PITS, "pitstops", ident]
];

const deriveColSpec = (columns) => {

  const spec = [];
  const reverseMap = [];
  let inferPosition = true;

  const availableCols = columns.map(c => `${c.n.toLowerCase().trim()}${c.p}`);

  DEFAULT_COLUMN_SPEC.forEach(
    ([stat, label, mappingFunc]) => {
      const tsnlIndex = availableCols.indexOf(label);
      if (tsnlIndex >= 0 && !spec.includes(stat)) {
        spec.push(stat);
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

const mapSession = (session, times, timeOffset) => {
  const retVal = {
    flagState: FLAG_MAP[session.flag] || FlagState.NONE
  };

  if (typeof(times.lt) !== 'undefined' && typeof(times.r) !== 'undefined' && typeof(times.q) !== 'undefined' && !!timeOffset) {
    if ((times.s || 0) === 0 && (times.e || 0) !== 0) {
      retVal['timeRemain'] = ((times.e || 0) - (times.s || 0)) / 1000000;
    }
    else if (!!times.h) {
      retVal['timeRemain'] = ((times.lt || 0) - (times.r || 0)) / 1000000;
    }
    else {
      const serverNow = realToServerTime(Date.now() / 1000 + timeOffset);
      const elapsed = serverNow - (times.q || 0) + (times.r || 0);
      retVal['timeElapsed'] = elapsed / 1000000;
      retVal['timeRemain'] = ((times.lt || 0) - elapsed) / 1000000;
    }
  }

  return retVal;
};

export const Translate = ({ state, updateManifest, updateState }) => {

  const { cars, columns, session, times, timeOffset } = state;

  const mappingState = useRef([[], [], false]);

  const [columnSpec, reverseColumnMap, inferPosition] = mappingState.current;

  useEffect(
    () => {
      mappingState.current = deriveColSpec(columns);
    },
    [columns]
  );

  useEffect(
    () => {
      updateManifest({
        name: (session.name && session.name.slice(0, session.name.lastIndexOf('-') - 1)) || '',
        description: (session.name && session.name.slice(session.name.lastIndexOf('-') + 1)) || '',
        columnSpec
      });
    },
    [columnSpec, session, updateManifest]
  );

  const positionSort = useCallback(
    (a, b) => {
      if (inferPosition) {
        return 0;
      }
      const [[tsnlIndex, mappingFunc]] = reverseColumnMap.slice(-1);
      return mappingFunc(a[tsnlIndex]) - mappingFunc(b[tsnlIndex]);
    },
    [inferPosition, reverseColumnMap]
  );

  useEffect(
    () => {
      updateState({
        cars: Object.values(cars).sort(positionSort).map(
          car => reverseColumnMap.map(
            ([tsnlIndex, mappingFunc]) => mappingFunc(car[tsnlIndex])
          )
        ),
        session: mapSession(session, times, timeOffset)
      });
    },
    [cars, positionSort, reverseColumnMap, session, timeOffset, times, updateState]
  );

  return null;
};
