import { Stat } from "../../../racing";
import { parseTime } from "../utils";

const mapCarState = (car) => {
  if (car.status.toLowerCase() === 'in pit' || !car.on_track) {
    return 'PIT';
  }
  return 'RUN';
};

const TYRE_MAP = {
  'P': ["P", "tyre-medium"],
  'A': ["O", "tyre-soft"],
  'W': ["W", "tyre-wet"],
  'WX': ["W", "tyre-wet"]
};

export const getManifest = ({ timing_results: { heartbeat } }) => {
  const isOval = heartbeat.trackType === 'O' || heartbeat.trackType === 'I';

  const ptpCol = isOval ? [] : [Stat.PUSH_TO_PASS];
  const sectorCols = isOval ?
    [
      Stat.T1_SPEED,
      Stat.BEST_T1_SPEED,
      Stat.T3_SPEED,
      Stat.BEST_T3_SPEED
    ]
    : [
      Stat.S1,
      Stat.BS1,
      Stat.S2,
      Stat.BS2,
      Stat.S3,
      Stat.BS3
    ];

  return {
    name: 'IndyCar',
    description: heartbeat['eventName'],
    colSpec: [
      Stat.NUM,
      Stat.STATE,
      Stat.DRIVER,
      Stat.TEAM,
      Stat.LAPS,
      Stat.TYRE
    ].concat(ptpCol).concat([
      Stat.GAP,
      Stat.INT,
    ]).concat(sectorCols).concat([
      Stat.LAST_LAP,
      Stat.BEST_LAP,
      Stat.PITS
    ])
  };
};

export const translate = (rawData) => {

  const { timing_results: { heartbeat, Item } } = rawData;

  const isOval = heartbeat.trackType === 'O' || heartbeat.trackType === 'I';

  const cars = [];

  const bestLap = {
    index: -1,
    time: null
  };

  Item.forEach(
    c => {

      let ptpCol = [];

      if (!isOval) {
        ptpCol = [[c["OverTake_Remain"], c["OverTake_Active"] === 1 ? "ptp-active" : ""]];
      }

      let sectorCols = [];

      if (!isOval) {
        const s1 = c['I1'];
        const bs1 = c['Best_I1'];
        const s2 = c['I2'];
        const bs2 = c['Best_I2'];
        const s3 = c['I3'];
        const bs3 = c['Best_I3'];

        sectorCols = [
          [s1, s1 === bs1 ? 'pb' : ''],
          [bs1, ''],
          [s2, s2 === bs2 ? 'pb' : ''],
          [bs2, ''],
          [s3, s3 === bs3 ? 'pb' : ''],
          [bs3, ''],
        ];

      }

      const lastLapTime = parseTime(c['lastLapTime']);
      const bestLapTime = parseTime(c['bestLapTime']);

      if (bestLapTime && (!bestLap.time || bestLap.time > bestLapTime)) {
        bestLap.time = bestLapTime;
        bestLap.index = cars.length;
      }

      cars.push([
        c['no'],
        mapCarState(c),
        `${c['firstName']} ${c['lastName']}`,
        c['team'],
        c['laps'],
        TYRE_MAP[c['Tire']] || c['Tire']
      ].concat(ptpCol).concat([
        c['diff'],
        c['gap']
      ]).concat(sectorCols).concat([
        [lastLapTime, lastLapTime === bestLapTime ? 'pb' : ''],
        [bestLapTime, ''],
        c['pitStops']
      ]));
    }
  );

  if (bestLap.index >= 0) {
    const bestCar = cars[bestLap.index];

    const bcbl = bestCar[bestCar.length - 2];
    const bcll = bestCar[bestCar.length - 3];

    if (bcbl[0] === bcll[0]) {
      bestCar[bestCar.length - 2][1] = 'sb-new';
    }
    else {
      bestCar[bestCar.length - 2][1] = 'sb';
    }
  }

  return {
    cars,
    session: {}
  };
};
