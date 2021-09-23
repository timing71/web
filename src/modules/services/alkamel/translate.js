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

      const gap = leadCar ? gapFunc(leadCar, { standing, entry }) : '';
      const interval = prevCar ? gapFunc(prevCar, { standing, entry }) : '';

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

      prevCar = { standing, entry };
      if (!leadCar) {
        leadCar = { standing, entry };
      }
    }
  );

  return cars;
};

export const Translator = ({ collections: { session_entry, session_info, track_info, standings }, session, updateManifest, updateState }) => {

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
        cars: mapCars(standings, session_entry, numSectors, gapFunc)
      });
    },
    [numSectors, session_entry, session_info?.type, standings, updateState]
  );

  return null;
};

export const getSectorCount = (trackInfo) => Object.keys((trackInfo?.sectors || {})).length;
