import { FlagState, Stat } from "../../../racing";
import { parseTime } from '../utils';

const colSpec = [
  Stat.NUM,
  Stat.STATE,
  Stat.DRIVER,
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
  Stat.PITS
];

const trackDataSpec = [
  "Track Temp",
  "Air Temp",
  "Wind Speed",
  "Direction",
  "Humidity",
  "Pressure",
  "Track"
];

const dasherizeParts = (...args) => {
  const result = [];

  args.forEach(
    a => {
      if (a) {
        result.push(a);
      }
    }
  );

  return result.join(' - ');
};

export const getManifest = (state) => {

  const details = state.racedetailsfeed;

  const description = dasherizeParts(
    details?.Round,
    details?.Race,
    details?.Session
  );

  return {
    name: details?.Season,
    description,
    colSpec,
    trackDataSpec
  };
};

const sortCars = (a, b) => {
  if (a.position?.Value) {
    if (b.position?.Value) {
      return parseInt(a.position.Value, 10) - parseInt(b.position.Value, 10);
    }
    else {
      return -1;
    }
  }
  else {
    return 0;
  }
};

const mapCarState = (state) => {
  if (state.Retired) {
    return 'RET';
  }
  if (state.InPit) {
    return 'PIT';
  }
  if (state.PitOut) {
    return 'OUT';
  }
  if (state.Stopped) {
    return 'STOP';
  }
  return 'RUN';
};

const parseTimeWithFlag = (time) => {
  const timeVal = time.Value === '.' ? '' : parseTime(time.Value);

  let flag = '';

  if (time.OverallFastest === 1) {
    flag = 'sb';
  }
  else if (time.PersonalFastest === 1) {
    flag = 'pb';
  }

  return [timeVal, flag];
};

const mapCar = (car, stat) => {
  const gap = car.gapP?.Value || car.gap?.Value;
  const interval = car.intervalP?.Value || car.interval?.Value;

  return [
    car.driver?.RacingNumber,
    mapCarState(car.status),
    car.driver?.FullName,
    car.laps?.Value,
    gap,
    interval,
    parseTimeWithFlag(car.sectors[0]),
    [parseTime((stat.BestSectors || [])[0]?.Value), 'old'],
    parseTimeWithFlag(car.sectors[1]),
    [parseTime((stat.BestSectors || [])[1]?.Value), 'old'],
    parseTimeWithFlag(car.sectors[2]),
    [parseTime((stat.BestSectors || [])[2]?.Value), 'old'],
    parseTimeWithFlag(car.last),
    parseTimeWithFlag(car.best),
    parseInt(car.pits?.Value || 0)
  ];
};

const mapCars = (cars, stats) => {

  const sortedCars = Object.values(cars).sort(sortCars);

  return sortedCars.map(
    car => {
      const stat = stats[car.driver.RacingNumber];
      return mapCar(car, stat);
    }
  );
};

const mapFlag = (flag) => {
  switch (flag?.Value) {
    case '1':
      return FlagState.GREEN;
    case '2':
      return FlagState.YELLOW;
    case '4':
      return FlagState.SC;
    case '5':
      return FlagState.RED;
    case '6':
    case '7':  // VSC ending
      return FlagState.VSC;
    default:
      return FlagState.NONE;
  }
};

const mapSession = (state, timestamps) => {

  const timeDelta = Math.max(0, Date.now() - (timestamps.timefeed || 0)) / 1000;
  const timeRemain = parseTime(state.timefeed?.timeRemaining);
  const clockRunning = !!state.timefeed?.clockRunning;

  let flag = FlagState.NONE;

  if (state.sessionfeed?.Value === 'Finished' || state.sessionfeed?.Value === 'Finalised') {
    flag = FlagState.CHEQUERED;
  }
  else if (state.sessionfeed?.Value === 'Aborted') {
    flag = FlagState.RED;
  }
  else {
    flag = mapFlag(state.trackfeed);
  }

  return {
    flagState: flag,
    pauseClocks: !clockRunning,
    timeRemain: clockRunning ? Math.max(0, timeRemain - timeDelta) : timeRemain,
    trackData: [
      `${state.weatherfeed?.tracktemp || '-'}°C`,
      `${state.weatherfeed?.airtemp || '-'}°C`,
      `${state.weatherfeed?.windspeed || '-'} m/s`,
      `${state.weatherfeed?.winddir || '-'}°`,
      `${state.weatherfeed?.humidity || '-'}%`,
      `${state.weatherfeed?.pressure || '-'} mbar`,
      state.weatherfeed?.rainfall === '1' ? 'Wet' : 'Dry'
    ]
  };
};

export const translate = (state, timestamps) => {
  return {
    cars: mapCars(state.data || {}, state.statsfeed || {}),
    session: mapSession(state, timestamps)
  };
};
