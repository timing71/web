import { useEffect } from 'react';
import { Stat } from '../../../racing';
import { getGapFunction } from './gap';

const SECTOR_STATS = [
  Stat.S1,
  Stat.S2,
  Stat.S3,
  Stat.S4,
  Stat.S5,
];

const createColspec = (numSectors, hasClasses) => ([
  Stat.NUM,
  Stat.STATE
].concat(
  hasClasses ? [Stat.CLASS, Stat.POS_IN_CLASS] : []
).concat([
  Stat.DRIVER,
  Stat.TEAM,
  Stat.CAR,
  Stat.LAPS,
  Stat.GAP,
  Stat.INT
]).concat(SECTOR_STATS.slice(0, numSectors)).concat([
  Stat.LAST_LAP,
  Stat.BEST_LAP,
  Stat.PITS
]));

const CAR_TRACK_STATES = {
  'BOX': 'PIT',
  'OUT_LAP': 'OUT',
  'STOPPED': 'STOP',
  'TRACK': 'RUN'
};

const CAR_STATES = {
  'RETIRED': 'RET',
  'NOT_CLASSIFIED': 'N/C',
  'NOT_STARTED': 'N/S',
  'DISQUALIFIED': 'DSQ',
  'EXCLUDED': 'DSQ'
};

const FLAG_STATES = {
  'YF': 'YELLOW',
  'FCY': 'FCY',
  'RF': 'RED',
  'SC': 'SC',
  'GF': 'GREEN'
};

const mapFlag = (status) => {
  if (status.isFinished) {
    return 'CHEQUERED';
  }
  return FLAG_STATES[status.currentFlag] || 'none';
};


const mapCarState = (status, trackStatus, chequered) => {
  if (status === '' && trackStatus === '') {
    return 'PIT';
  }
  if (chequered && 'CLASSIFIED' === status.toUpperCase()) {
    return 'FIN';
  }
  return CAR_STATES[status.toUpperCase()] || CAR_TRACK_STATES[trackStatus.toUpperCase()] || '???';
};

const parseSectors = (raw, defaultFlag = '') => {
  const sectors = {};
  const parts = raw.split(';');
  const lenParts = parts.length;

  for(let i = 0; i < lenParts; i += 6) {
    const sectorNum = parts[i];
    if (sectorNum !== '') {
      const time = parts[i + 1] / 1000;
      let flag = defaultFlag;
      if (parts[i + 3] === 'true' || parts[i + 4] === 'true') {
        flag = 'sb';
      }
      else if (parts[i + 2] === 'true') {
        flag = 'pb';
      }
      else if (parts[i + 5] === 'true') {
        flag = 'old';
      }

      sectors[sectorNum] = [time, flag];
    }
  }

  return sectors;
};

const parseLoops = (loopString) => {
  const loops = {};

  const parts = (loopString || '').split(';');

  if (parts.length > 1) {
    for(let i = 0; i < parts.length; i += 2) {
      loops[parseInt(parts[i], 10)] = parseInt(parts[i + 1], 10);
    }
  }


  return loops;
};

const augment = (standing) => {

  const data = (standing.data || '').split(';');

  return ({
    ...standing,
    currentLoops: parseLoops(standing.currentLoopSectors),
    previousLoops: parseLoops(standing.previousLoopSectors),
    laps: parseInt(data[4], 10) || 0,
    currentLapNumber: parseInt(data[9], 10) || 0,
    currentLapStartTime: parseInt(data[7], 10) || 0
  });
};

const mapCars = (standings, entries, numSectors, gapFunc) => {
  let leadCar = null;
  let prevCar = null;
  const cars = [];
  const classCount = {};

  Object.values(standings?.standings || {}).forEach(
    standing => {
      const data = standing.data.split(';');
      const raceNum = data[1];
      const entry = entries[raceNum] || {};

      classCount[entry.class] = (classCount[entry.class] || 0) + 1;

      const sectorCols = [];

      const currentSectors = parseSectors(standing.currentSectors);
      const prevSectors = parseSectors(standing.lastSectors, 'old');

      for (let i = 0; i < numSectors; i++) {
        sectorCols.push(
          currentSectors[i + 1] || prevSectors[i + 1] || ['', '']
        );
      }

      const augmentedStanding = augment(standing);

      const gap = leadCar ? gapFunc(leadCar, augmentedStanding) : '';
      const interval = prevCar ? gapFunc(prevCar, augmentedStanding) : '';

      const lastLapTime = (standing.lastLapTime || 0) / 1000;
      const bestLapTime = (standing.bestLapTime || 0) / 1000;

      cars.push([
        raceNum,
        mapCarState(data[2], data[8], !!standing.isCheckered)
      ].concat(
        standings.hasClasses ? [entry.class, classCount[entry.class]] : []
      ).concat([
        `${(entry.lastname || '').toUpperCase()}, ${entry.firstname}`,
        entry.team,
        entry.vehicle,
        data[4],
        gap,
        interval
      ]).concat(sectorCols).concat([
        lastLapTime > 0 ? [lastLapTime, standing.isLastLapBestPersonal ? 'pb' : ''] : ['', ''],
        [bestLapTime > 0 ? bestLapTime : '', ''],
        data[5]
      ]));

      prevCar = augmentedStanding;
      if (!leadCar) {
        leadCar = augmentedStanding;
      }
    }
  );

  return cars;
};

const mapSession = (status={}) => {
  const session = {
    flagState: mapFlag(status)
  };

  const now = Date.now() / 1000;

  if (status.isForcedByTime || status.finalType === 'BY_TIME' || status.finalType === 'BY_TIME_PLUS_LAPS') {
    if (status.isSessionRunning) {
      session['timeRemain'] = Math.max((status.startTime + status.finalTime) - now + status.stoppedSeconds, 0);
    }
    else if (status.startTime > 0) {
      session['timeRemain'] = Math.max((status.startTime + status.finalTime) - status.stopTime - now + status.stoppedSeconds, 0);
    }
    else {
      session['timeRemain'] = status.finalTime;
    }
  }
  else {
    session['lapsRemain'] = Math.max(0, (status.finalLaps || 0) - (status.elapsedLaps || 0));
  }

  if (status.startTime > 0) {
    if (status.stopTime > 0 && ! status.isSessionRunning) {
      session['timeElapsed'] = status.stopTime - status.startTime;
    }
    else {
      session['timeElapsed'] = (now - status.startTime) - (status.stoppedSeconds || 0);
    }
  }

  return session;
};

export const Translator = ({ collections: { session_entry, session_info, session_status, track_info, standings }, session, updateManifest, updateState }) => {

  const numSectors = getSectorCount(track_info);

  useEffect(
    () => {
      updateManifest({
        name: session_info?.champName || '',
        description: `${session_info?.eventName} - ${session?.name}`,
        columnSpec: createColspec(numSectors, standings?.hasClasses)
      });
    },
    [
      session_info,
      standings?.hasClasses,
      numSectors,
      session,
      updateManifest
    ]
  );

  useEffect(
    () => {
      const gapFunc = getGapFunction(session_info?.type);
      updateState({
        cars: mapCars(standings, session_entry, numSectors, gapFunc),
        session: mapSession(session_status)
      });
    },
    [numSectors, session_entry, session_info?.type, session_status, standings, updateState]
  );

  return null;
};

export const getSectorCount = (trackInfo) => Object.keys((trackInfo?.sectors || {})).length;
