import { Stat } from "../../../racing";
import { parseTime } from '../utils';

const COLUMN_SPEC = [
  Stat.NUM,
  Stat.STATE,
  Stat.DRIVER,
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


export const getManifest = (raceName, sessionName) => ({
  name: 'W Series',
  description: `${raceName} - ${sessionName[0].toUpperCase()}${sessionName.slice(1)}`,
  colSpec: COLUMN_SPEC
});

export const getState = (data) => {
  return {
    cars: (data.Line || []).map(mapCar(data.Session)),
    session: {
      flagState: 'green'
    }
  };
};

const mapCar = session => (car) => {

  const gapKey = session !== 'Race' ? 'TimeDiffToFastest' : 'GapToLeader';
  const intKey = session !== 'Race' ? 'TimeDiffToPositionAhead' : 'IntervalToPositionAhead';

  const sectors = car.Sectors?.Sector || [{}, {}, {}];

  return [
    car.Driver?.RacingNumber,
    mapCarState(car.DriverStatus),
    car.Driver?.FullName,
    car.NumberOfLaps?.Value,
    car[gapKey]?.Value,
    car[intKey]?.Value,
    mapSector(sectors[0]),
    mapSector(sectors[1]),
    mapSector(sectors[2]),
    mapLaptime(car.LastLapTime),
    mapLaptime(car.PersonalBestLapTime),
    car.NumberOfPitStops?.Value
  ];
};

const mapCarState = (state) => {
  if (state.Retired === 'True') {
    return 'RET';
  }
  if (state.InPit === 'True') {
    return 'PIT';
  }
  if (state.PitOut === 'True') {
    return 'OUT';
  }
  if (state.Stopped === 'True') {
    return 'STOP';
  }
  return 'RUN';
};

const mapSector = (sector) => {
  return [parseFloat(sector.Value) || '', mapTimeFlag(sector)];
};

const mapLaptime = (time) => {
  return [parseTime(time.Value), mapTimeFlag(time)];
};

const mapTimeFlag = (flag) => {
  if (flag.OverallFastest === 'True') {
    return 'sb';
  }
  if (flag.PersonalFastest === 'True') {
    return 'pb';
  }
  return '';
};
