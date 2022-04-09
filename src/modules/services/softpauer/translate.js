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
      return FlagState.GREEN;
  }
};

const getTimeRemaining = (clock) => {
  if (clock.Remaining) {
    const remTime = parseTime(clock.Remaining);

    if (clock.Extrapolating) {
      const timestamp = new Date(clock.Utc).getTime();
      const delta = Date.now() - timestamp;
      return remTime - (delta / 1000);
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
  return Array(7).fill('-');
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

const TYRE_MAP = {
  'H': ['H', 'tyre-hard'],
  'M': ['M', 'tyre-med'],
  'S': ['S', 'tyre-soft'],
  'I': ['I', 'tyre-inter'],
  'W': ['W', 'tyre-wet'],
  'U': ['U', 'tyre-development'],
  'p': ['P', 'tyre-development']
};

const TIME_FLAGS = {
  'P': 'sb',
  'G': 'pb',
  'Y': 'old'
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

      const { driver, extra, latestTimeLine, sq, timeLine } = car;

      const colourFlags = latestTimeLine[2] || [];

      let currentTyre = '';
      let currentTyreStats = ['', ''];

      if (extra.X && extra.X[9] !== '') {
        currentTyre = TYRE_MAP[extra.X[9][0]] || extra.X[9][0];
        currentTyreStats = (extra.TI || []).slice(-2);
      }

      const lastLap = parseTime(latestTimeLine[1]);
      const bestLap = parseTime(timeLine[1]);

      return [
        driver['Num'],
        mapCarState(latestTimeLine[3][2]),
        `${driver.LastName.toUpperCase()}, ${driver.FirstName}`,
        Math.floor(sq[0] || 0),
        currentTyre,
        currentTyreStats[0],
        currentTyreStats[1],
        renderGapOrLaps(latestTimeLine[9]),
        renderGapOrLaps(latestTimeLine[14]),
        [latestTimeLine[5], TIME_FLAGS[colourFlags[1]]],
        [timeLine[4], 'old'],
        [latestTimeLine[6], TIME_FLAGS[colourFlags[2]]],
        [timeLine[7], 'old'],
        [latestTimeLine[7], TIME_FLAGS[colourFlags[3]]],
        [timeLine[10], 'old'],
        [lastLap > 0 ? lastLap : '', TIME_FLAGS[colourFlags[0]]],
        [bestLap, 'old'],
        latestTimeLine[3][0],
      ];
    }
  );
};

const blIdx = colSpec.indexOf(Stat.BEST_LAP);
const bs1Idx = colSpec.indexOf(Stat.BS1);

const postprocessCars = (cars) => {

  const bestLap = { };
  const bestSectors = { 0: {}, 1: {}, 2: {} };

  cars.forEach(
    (car, idx) => {
      const bl = car[blIdx][0];
      if (bl && (!bestLap.time || bestLap.time > bl)) {
        bestLap.time = bl;
        bestLap.index = idx;
      }

      [0, 1, 2].forEach(
        sector => {
          const time = car[bs1Idx + (2 * sector)][0];
          if (time && (!bestSectors[sector].time || bestSectors[sector].time > time)) {
            bestSectors[sector].time = time;
            bestSectors[sector].index = idx;
          }
        }
      );
    }
  );

  if (bestLap.index >= 0) {
    cars[bestLap.index][blIdx] = [bestLap.time, 'sb'];
    if (cars[bestLap.index][blIdx - 1][0] === bestLap.time) {
      cars[bestLap.index][blIdx - 1][1] = cars[bestLap.index][bs1Idx + 3][0] !== '' ? 'sb-new' : 'sb';
    }
  }

  [0, 1, 2].forEach(
    sector => {
      const { index } = bestSectors[sector];
      if (index >= 0) {
        cars[index][bs1Idx + (2 * sector)][1] = 'sb';
      }
    }
  );

  return cars;
};

export const translate = (state, clock) => {

  const { free, sq } = state;

  const cars = denormaliseDrivers(state);
  const mapped = postprocessCars(mapCars(cars));

  return {
    cars: mapped,
    session: {
      flagState: parseFlagState(free.data?.FL),
      timeRemain: getTimeRemaining(clock),
      pauseClocks: !clock.Extrapolating,
      trackData: getTrackData(sq?.data?.W)
    }
  };
};
