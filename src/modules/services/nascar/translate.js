import { FlagState, Stat } from "../../../racing";

const FLAG_MAP = {
  1: FlagState.GREEN,
  2: FlagState.CAUTION,
  3: FlagState.RED,
  4: FlagState.CHEQUERED,
  5: FlagState.WHITE,
  8: FlagState.NONE,
  9: FlagState.NONE
};

const RUN_TYPES = {
  [-1]: 'No live session',
  1: 'Practice',
  2: 'Qualifying',
  3: 'Race'
};

const SERIES_TYPES = {
  1: 'NASCAR Cup Series',
  2: 'NASCAR Xfinity Series',
  3: 'NASCAR Truck Series',
  999: 'ARCA Menards Series'
};

const descriptionFromParts = (...parts) => {
  return parts.filter(p => !!p).join(' - ');
};

const usesStages = (data) => {
  const stage = data['stage'] || {};
  const totalRaceLaps = data['laps_in_race'] || 0;
  return stage['laps_in_stage'] < totalRaceLaps;
};

const trackDataSpec = (data) => {
  if (usesStages(data)) {
    return ['Stage', 'Laps remaining'];
  }
  return [];
};

export const getManifest = (data) => ({
  name: SERIES_TYPES[data['series_id']] || 'NASCAR',
  description: descriptionFromParts(data['run_name'] || data['track_name'], RUN_TYPES[data['run_type']]),
  colSpec: [
    Stat.NUM,
    Stat.STATE,
    Stat.DRIVER,
    Stat.CAR,
    Stat.LAPS,
    Stat.GAP,
    Stat.INT,
    Stat.LAST_LAP,
    Stat.SPEED,
    Stat.BEST_LAP,
    Stat.BEST_SPEED,
    Stat.PITS
  ],
  trackDataSpec: trackDataSpec(data)
});

const mapCars = (cars) => {
  const result = [];

  let bestLapCar = null;
  let bestLapTime = null;
  let prevDelta = 0;

  cars.sort((a, b) => (a['running_position'] || 0) - (b['running_position'] || 0)).forEach(
    (car, idx) => {

      if (
        car['best_lap_time'] > 0 &&
        (bestLapCar === null || bestLapTime > car['best_lap_time'])
      ) {
        bestLapCar = idx;
        bestLapTime = car['best_lap_time'];
      }

      const llf = car['best_lap_time'] === car['last_lap_time'] ? 'pb' : '';

      let gap = car['delta'] || 0;
      let interval = gap - prevDelta;
      prevDelta = gap;

      if (gap < 0) {
        gap = `${Math.floor(Math.abs(gap))} lap${gap === -1 ? '' : 's'}`;

        if (interval < 0) {
          if (Math.floor(interval) === interval) {
            interval = `${Math.floor(Math.abs(interval))} lap${interval === -1 ? '' : 's'}`;
          }
          else {
            interval = '';
          }
        }
      }

      const lastLap = car['last_lap_time'] || 0;
      const lastLapSpeed = car['last_lap_speed'] || 0;
      const bestLap = car['best_lap_time'] || 0;
      const bestLapSpeed = car['best_lap_speed'] || 0;

      const actualPitStops = (car['pit_stops'] || []).filter(p => p['pit_in_elapsed_time'] > 0).length;

      result.push([
        car['vehicle_number'],
        car['is_on_track'] ? 'RUN' : 'PIT',
        car['driver']['full_name'].replace(/[*#]|\(i\)/g, ''),
        car['vehicle_manufacturer'],
        car['laps_completed'],
        gap !== 0 ? gap : '',
        interval !== 0 ? interval : '',
        lastLap > 0 ? [lastLap, llf] : ['', ''],
        lastLapSpeed > 0 ? lastLapSpeed : '',
        bestLap > 0 ? [bestLap, ''] : ['', ''],
        bestLapSpeed > 0 ? bestLapSpeed : '',
        actualPitStops
      ]);

    }
  );

  if (bestLapCar !== null) {
    const bestCar = result[bestLapCar];
    if (bestCar[7][0] === bestCar[9][0]) {
      bestCar[7] = [bestCar[7][0], 'sb-new'];
    }
    bestCar[9] = [bestCar[9][0], 'sb'];
  }

  return result;
};

export const translate = (data) => {

  const stage = data.stage || {};

  let trackData = [];

  if (usesStages(data)) {
    trackData = [
      stage['stage_num'] || '',
      (stage['finish_at_lap'] || 0) - (data['lap_number'] || 0)
    ];
  }

  const session = {
    flagState: FLAG_MAP[data['flag_state']] || FlagState.NONE,
    timeElapsed: data['elapsed_time'] || 0,
    trackData
  };

  if (data['run_type'] === 3) {
    session.lapsRemain = data['laps_to_go'];
  }

  return {
    cars: mapCars(data.vehicles),
    session
  };
};
