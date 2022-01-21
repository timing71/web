import { useCallback, useEffect, useRef } from 'react';
import { useServiceManifest, useServiceState } from '../../../components/ServiceContext';
import { FlagState, Stat } from '../../../racing';
import { RaceControlMessage } from '../../messages/Message';
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
  'YF': FlagState.YELLOW,
  'FCY': FlagState.FCY,
  'RF': FlagState.RED,
  'SC': FlagState.SC,
  'GF': FlagState.GREEN
};

const mapFlag = (status) => {
  if (status.isFinished) {
    return FlagState.CHEQUERED;
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
      if (parts[i]) {
        loops[parts[i]] = parseInt(parts[i + 1], 10);
      }
    }
  }

  return loops;
};

export const augment = (standing) => { // Exported for tests

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

const mapCars = (standings, entries, numSectors, gapFunc, bestResults, bestResultsByClass) => {
  let leadCar = null;
  let prevCar = null;
  const cars = [];
  const classCount = {};

  const overallBestLap = bestResults?.bestLap || {};
  const classBestLaps = bestResultsByClass?.bestLapsByClass || {};

  Object.values(standings?.standings || {}).forEach(
    standing => {
      const data = standing.data.split(';');
      const raceNum = data[1];
      const entry = (entries && entries[raceNum]) || {};
      const state = mapCarState(data[2], data[8], !!standing.isCheckered);

      classCount[entry.class] = (classCount[entry.class] || 0) + 1;

      const sectorCols = [];

      const currentSectors = parseSectors(standing.currentSectors);
      const prevSectors = parseSectors(standing.lastSectors, 'old');

      for (let i = 0; i < numSectors; i++) {
        const current = currentSectors[i + 1];
        const prev = prevSectors[i + 1];
        sectorCols.push(
          (current && current[0] > 0) ? current : (prev && prev[0] > 0) ? prev : ['', '']
        );
      }

      const augmentedStanding = augment(standing);

      const gap = leadCar ? gapFunc(leadCar, augmentedStanding) : '';
      const interval = prevCar ? gapFunc(prevCar, augmentedStanding) : '';

      const lastLapTime = (standing.lastLapTime || 0) / 1000;
      let lastLapFlag = standing.isLastLapBestPersonal ? 'pb' : '';

      const bestLapTime = (standing.bestLapTime || 0) / 1000;
      let bestLapFlag = '';

      const hasOverallBest = overallBestLap.participantNumber === raceNum;
      const hasClassBest = entry.class && (classBestLaps[entry.class] || {}).participantNumber === raceNum;

      if (hasOverallBest || hasClassBest) {
        bestLapFlag = 'sb';
        if (lastLapTime === bestLapTime) {
          if ((state === 'RUN' || state === 'FIN') && '3' in currentSectors) {
            lastLapFlag = 'sb-new';
          }
          else {
            lastLapFlag = 'sb';
          }
        }
      }

      cars.push([
        raceNum,
        state
      ].concat(
        standings.hasClasses ? [entry.class, classCount[entry.class]] : []
      ).concat([
        `${(entry.lastname || '').toUpperCase()}, ${entry.firstname}`,
        entry.team,
        entry.vehicle,
        data[4],
        gap > 0 || typeof(gap) === 'string' ? gap : '',
        interval > 0 || typeof(interval) === 'string' ? interval : ''
      ]).concat(sectorCols).concat([
        lastLapTime > 0 ? [lastLapTime, lastLapFlag] : ['', ''],
        bestLapTime > 0 ? [bestLapTime, bestLapFlag] : ['', ''],
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

const mapSession = (status={}, weather={}, unitOfMeasure) => {
  const speedUnit = unitOfMeasure === 'US' ? 'mph' : 'kph';
  const speedMultiplier = unitOfMeasure === 'US' ? 0.621371 : 1;
  const session = {
    flagState: mapFlag(status),
    trackData:[
      `${weather.ambientTemperature || '-'}°C`,
      `${weather.trackTemperature || '-'}°C`,
      `${weather.humidity || '-'}%`,
      `${weather.windSpeed == null ? '-' : (weather.windSpeed * speedMultiplier).toFixed(1)} ${speedUnit}`,
    ]
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

  if (!status.isSessionRunning) {
    session['pauseClocks'] = true;
  }

  return session;
};

export const Translator = ({
  collections: { best_results, race_control, sessionBestResultsByClass, session_entry, session_info, session_status, track_info, standings, weather },
  session,
}) => {

  const raceControlLastMessage = useRef(-1);

  const numSectors = getSectorCount(track_info);

  const { updateManifest } = useServiceManifest();
  const { updateState } = useServiceState();

  const extractRaceControlMessages = useCallback(
    (messages) => {
      const result = [];
      const newMessageIndexes = Object.keys(messages).filter(k => k > raceControlLastMessage.current);

      if (newMessageIndexes.length > 0) {
        if (raceControlLastMessage.current === -1) {
          raceControlLastMessage.current = Math.max(...newMessageIndexes);
        }
        else {
          newMessageIndexes.reverse().forEach(
            i => {
              raceControlLastMessage.current = Math.max(raceControlLastMessage.current, i);
              result.push(
                new RaceControlMessage(
                  messages[i].message
                ).toCTDFormat()
              );
            }
          );
        }
      }
      return result;
    },
    []
  );

  useEffect(
    () => {
      updateManifest({
        name: session_info?.champName || '',
        description: `${session_info?.eventName} - ${session?.name}`,
        colSpec: createColspec(numSectors, standings?.hasClasses),
        trackDataSpec: [
          'Air temp',
          'Track temp',
          'Humidity',
          'Wind speed'
        ]
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
        cars: mapCars(standings, session_entry, numSectors, gapFunc, best_results, sessionBestResultsByClass),
        session: mapSession(session_status, weather, session_info?.unitOfMeasure),
        extraMessages: extractRaceControlMessages(race_control?.log || {})
      });
    },
    [
      best_results,
      extractRaceControlMessages,
      numSectors,
      race_control,
      sessionBestResultsByClass,
      session_entry,
      session_info,
      session_status,
      standings,
      weather,
      updateState
    ]
  );


  return null;
};

export const getSectorCount = (trackInfo) => Object.keys((trackInfo?.sectors || {})).length;
