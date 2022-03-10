import { FlagState, Stat } from "../../../racing";
import { parseTime } from "../utils";

const colSpec = [
  Stat.NUM,
  Stat.STATE,
  Stat.DRIVER,
  Stat.LAPS,
  Stat.TYRE,
  Stat.TYRE_STINT,
  Stat.TYRE_AGE,
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

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

export const getManifest = (state) => {
  return {
    colSpec,
    name: `Formula ${ 3 - 2 }`,
    description: state.free ? `${toTitleCase(state.free.data?.R || '')} - ${state.free.data?.S}` : '-',
    trackDataSpec
  };
};

const parseFlagState = (f) => {
  switch(f) {
    case 'C':
      return FlagState.CHEQUERED;
    case 'Y':
      return FlagState.YELLOW;
    case 'V':
      return FlagState.VSC;
    case 'S':
      return FlagState.SC;
    case 'R':
      return FlagState.RED;
    default:
      return FlagState.NONE;
  }
};

const getTimeRemaining = (clock) => {
  if (clock.Remaining) {
    const remTime = parseTime(clock.Remaining);

    if (clock.Extrapolating) {
      const timestamp = new Date(clock.Utc).getTime();
      const delta = Date.now() - timestamp;
      return remTime - delta;
    }

    return remTime;
  }
  return null;
};

const getTrackData = (w) => {
  if (w) {
    return [
      `${w[0]}°C`,
      `${w[1]}°C`,
      `${w[3]}m/s`,
      `${w[6]}°`,
      `${w[4]}%`,
      `${w[5]} mbar`,
      w[2] === 1 ? 'Wet' : 'Dry'
    ];
  }
  return [];
};

const denormaliseDrivers = (state) => {

  const { best, init, opt, sq, xtra } = state;
  const drivers = init?.data?.Drivers || [];

  return drivers.map(
    (driver, idx) => ({
      driver,
      timeLine: best?.data?.DR ? best.data.DR[idx].B : [],
      latestTimeLine: opt?.data?.DR ? opt.data.DR[idx].O : [],
      sq: sq?.data?.DR ? sq.data.DR[idx].G : [],
      extra: xtra?.data?.DR ? xtra.data.DR[idx] : {}
    })
  );
};

const mapCarState = (s) => {
  switch (s) {
    case '1':
      return 'PIT';
    case '2':
      return 'OUT';
    case '3':
      return 'STOP';
    default:
      return 'RUN';
  }
};

const renderGapOrLaps = (raw) => {
  if (raw !== '' && raw[0] === '-') {
    return `${-1 * raw} lap${raw === -1 ? '' : 's'}`;
  }
  return raw;
};

const mapCars = (cars) => {
  return cars.sort(
    (a, b) => (a.latestTimeLine[4] - b.latestTimeLine[4]) || (-1 * a.latestTimeLine[3]) - (-1 * b.latestTimeLine[3])
  ).map(
    (car) => {

      const { driver, latestTimeLine, sq } = car;

      return [
        driver['Num'],
        mapCarState(latestTimeLine[3][2]),
        `${driver.LastName.toUpperCase()}, ${driver.FirstName}`,
        Math.floor(sq[0]),
        '',
        '',
        '',
        renderGapOrLaps(latestTimeLine[9]),
        renderGapOrLaps(latestTimeLine[14]),
      ];
    }
  );
};

export const translate = (state, clock, messages) => {

  const { free, sq } = state;

  const cars = denormaliseDrivers(state);
  const mapped = mapCars(cars);

  return {
    cars: mapped,
    session: {
      flagState: parseFlagState(free.data?.FL),
      timeRemain: getTimeRemaining(clock),
      trackData: getTrackData(sq?.data?.W)
    }
  };
};
