import { FlagState, Stat } from '../../../racing';
import { dasherizeParts, parseTime } from '../utils';

const COLSPEC = [
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
  Stat.S2,
  Stat.S3,
  Stat.LAST_LAP,
  Stat.BEST_LAP,
  Stat.PITS
];

export const generateManifest = (meeting, schedule, session) => {
  const name = schedule.Competitions[session.CompetitionId]?.Name || 'Swiss Timing';

  const description = dasherizeParts(
    meeting?.TrackName,
    (session?.Name || '').replace(name, '').trim()
  );

  return {
    name,
    colSpec: COLSPEC,
    description
  };
};

const sortCars = (a, b) => a.ListIndex - b.ListIndex;

const CAR_STATE_MAP = {
  0: '?',
  1: 'FIN',
  2: 'RUN',
  4: 'RET',
  16: 'RET',
  32: 'N/S'
};

const mapCarState = (status, inPitLane) => {
  if (inPitLane) {
    return 'PIT';
  }

  return CAR_STATE_MAP[status];
};

const TIME_FLAGS = {
  0: '',
  1: 'pb',
  2: 'sb'
};

const parseTimeData = (t) => {
  if (t && t.Time) {
    return [
      parseTime(t.Time),
      TIME_FLAGS[t.TimeState] || ''
    ];
  }
  return ['', ''];
};

export const translateState = (timing, session, lapCache) => {

  const mapCar = (car) => {
    const competitor = (session?.Competitors || {})[car.CompetitorId] || {};
    const mainResult = car.MainResult || {};

    const clazz = ((session?.Classes || {})[competitor.ClassId] || {}).ShortName;

    const driver = (competitor.Drivers || {})[competitor.CurrentDriverId];

    // Keep track of previous lap before it disappears from timing data after first sector
    let lastLap = parseTimeData(mainResult.LastLap);
    if (lastLap[0] === '' && lapCache[competitor.Bib]) {
      lastLap = lapCache[competitor.Bib];
      if (lastLap[1] === '') {
        lastLap[1] = 'old';
      }
    }
    else {
      lapCache[competitor.Bib] = lastLap;
    }

    return [
      competitor.Bib,
      mapCarState(mainResult.Status, competitor.InPitLane),
      clazz,
      car.ListIndexClass + 1,
      competitor.ShortTeamName || competitor.TeamName || '',
      driver ? `${driver.LastName.toUpperCase()}, ${driver.FirstName}` : '',
      competitor.CarTypeName,
      mainResult.TotalLapCount,
      mainResult.Behind || '',
      mainResult.Diff || '',
      parseTimeData((mainResult?.LastLap?.Intermediates || {})[0]),
      parseTimeData((mainResult?.LastLap?.Intermediates || {})[1]),
      parseTimeData((mainResult?.LastLap?.Intermediates || {})[2]),
      lastLap,
      [parseTimeData(mainResult.BestTime)[0], 'old'],
      competitor.PitStopCount
    ];
  };

  const state = {
    cars: postprocessCars(
      Object.values(timing?.Results || {}).sort(sortCars).map(mapCar)
    ),
    session: {
      timeRemain: parseTime(timing?.UntInfo?.RemainingTime),
      pauseClocks: timing?.UntInfo?.TrackFlag === 0,
      flagState: mapSessionFlag(timing?.UntInfo || {})
    }
  };

  return state;
};

const postprocessCars = (cars) => {
  const classIndex = COLSPEC.indexOf(Stat.CLASS);
  const llIndex = COLSPEC.indexOf(Stat.LAST_LAP);
  const blIndex = COLSPEC.indexOf(Stat.BEST_LAP);
  const s3Index = COLSPEC.indexOf(Stat.S3);

  const bestLapsByClass = {};

  cars.forEach(
    (car, idx) => {
      const bl = car[blIndex];
      const clazz = car[classIndex];

      if (bl[0] > 0 && (!bestLapsByClass[clazz] || bestLapsByClass[clazz].time > bl[0])) {
        bestLapsByClass[clazz] = { time: bl[0], index: idx };
      }
    }
  );

  Object.values(bestLapsByClass).forEach(
    ({ time, index }) => {
      const bestCar = cars[index];
      const ll = bestCar[llIndex];
      bestCar[blIndex] = [bestCar[blIndex][0], 'sb'];
      if (ll[0] === time && bestCar[s3Index][0] !== '') {
        bestCar[llIndex] = [ll[0], 'sb-new'];
      }
    }
  );

  return cars;
};

const FLAG_MAP = {
  0: FlagState.NONE,
  1: FlagState.GREEN,
  4: FlagState.YELLOW,
  8: FlagState.RED,
  32: FlagState.SC,
  64: FlagState.CODE_60,
  268435456: FlagState.NONE
};

const mapSessionFlag = (session) => {

  if (session.ChequeredFlag) {
    return FlagState.CHEQUERED;
  }
  if (session.TrackFlag === 4) {
    return FlagState.FCY;
  }

  const maxFlag = Math.max(...(session?.SectorFlags || []), session.TrackFlag);

  return FLAG_MAP[maxFlag] || FlagState.NONE;

};
