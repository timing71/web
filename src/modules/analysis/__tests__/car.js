import { FlagState, Stat } from '@timing71/common';
import { StatExtractor } from '../../../statExtractor';
import { Car } from '../car';

const COLUMN_SPEC = [
  Stat.NUM,
  Stat.CLASS,
  Stat.DRIVER,
  Stat.LAPS
];

const statExtractor = new StatExtractor(COLUMN_SPEC);

const STATIC_DATA_COLSPEC = [
  ...COLUMN_SPEC,
  Stat.TEAM,
  Stat.CAR
];

const sdStatExtractor = new StatExtractor(STATIC_DATA_COLSPEC);

const RACE_NUM = '42';
const ARBITRARY_TIMESTAMP = 1638227769170;

describe(
  'Car',
  () => {
    it('keeps a list of drivers', () => {

      const car = Car.create({ raceNum: RACE_NUM });
      expect(car.drivers.length).toEqual(0);

      car.update(
        null, null,
        statExtractor,
        [ RACE_NUM, 'clazz', 'John Hindhaugh', 1 ]
      );

      expect(car.drivers.length).toEqual(1);
      expect(car.drivers[0].name).toEqual('John Hindhaugh');

      car.update(
        null, null,
        statExtractor,
        [ RACE_NUM, 'clazz', 'Eve Hewitt', 1 ]
      );

      expect(car.drivers.length).toEqual(2);
      expect(car.drivers[1].name).toEqual('Eve Hewitt');

      car.update(
        null, null,
        statExtractor,
        [ RACE_NUM, 'clazz', 'John Hindhaugh', 1 ]
      );
      // We don't add a duplicate entry
      expect(car.drivers.length).toEqual(2);

    });

    it('takes the first seen value for team name, class and car make', () => {
      const car = Car.create({ raceNum: RACE_NUM });
      expect(car.teamName).toBeUndefined();

      car.update(
        null, null,
        sdStatExtractor,
        [ RACE_NUM, 'LMP71', 'Jonny Palmer', 2, 'Team RSL', 'VW Beetle' ]
      );

      expect(car.teamName).toEqual('Team RSL');
      expect(car.raceClass).toEqual('LMP71');
      expect(car.make).toEqual('VW Beetle');

      car.update(
        null, null,
        sdStatExtractor,
        [ RACE_NUM, 'LMP71B', 'Jonny Palmer', 2, 'XXXTeam RSL', 'XXXVW Beetle' ]
      );

      expect(car.teamName).toEqual('Team RSL');
      expect(car.raceClass).toEqual('LMP71');
      expect(car.make).toEqual('VW Beetle');
    });

    it('records laptimes within a stint', () => {
      const colSpec = [
        Stat.NUM,
        Stat.DRIVER,
        Stat.LAST_LAP
      ];
      const se = new StatExtractor(colSpec);

      const car = Car.create({ raceNum: RACE_NUM });
      expect(car.currentStint).toBeNull();

      car.update(
        se, [ RACE_NUM, 'John Hindhaugh', ['', ''] ],
        se, [ RACE_NUM, 'John Hindhaugh', [123.456, ''] ],
        FlagState.GREEN,
        ARBITRARY_TIMESTAMP
      );

      expect(car.currentStint).not.toBeNull();
      const lap = car.currentStint.laps[0];
      expect(lap.laptime).toEqual(123.456);
      expect(lap.driver.name).toEqual('John Hindhaugh');
      expect(lap.flag).toEqual(FlagState.GREEN);

      car.update(
        se, [ RACE_NUM, 'John Hindhaugh', [123.456, ''] ],
        se, [ RACE_NUM, 'John Hindhaugh', [123.456, ''] ],
        FlagState.GREEN,
        ARBITRARY_TIMESTAMP
      );

      car.update(
        se, [ RACE_NUM, 'John Hindhaugh', [123.456, ''] ],
        se, [ RACE_NUM, 'John Hindhaugh', [124.789, ''] ],
        FlagState.GREEN,
        ARBITRARY_TIMESTAMP
      );

      expect(car.currentStint.laps.length).toEqual(2);
    });

    it('ends a stint when car enters the pits', () => {

      const colSpec = [
        Stat.NUM,
        Stat.STATE,
        Stat.DRIVER,
        Stat.LAST_LAP
      ];
      const se = new StatExtractor(colSpec);
      const car = Car.create({ raceNum: RACE_NUM });

      car.update(
        se, [ RACE_NUM, 'RUN', 'Shea Adam', ['', ''] ],
        se, [ RACE_NUM, 'RUN', 'Shea Adam', [123.456, ''] ],
        FlagState.GREEN,
        ARBITRARY_TIMESTAMP
      );
      expect(car.isInPit).toBeFalsy();
      expect(car.currentStint).not.toBeNull();

      car.update(
        se, [ RACE_NUM, 'RUN', 'Shea Adam', [123.456, ''] ],
        se, [ RACE_NUM, 'RUN', 'Shea Adam', [122.321, ''] ],
        FlagState.GREEN,
        ARBITRARY_TIMESTAMP + 1
      );

      car.update(
        se, [ RACE_NUM, 'RUN', 'Shea Adam', [122.321, ''] ],
        se, [ RACE_NUM, 'PIT', 'Shea Adam', [122.321, ''] ],
        FlagState.GREEN,
        ARBITRARY_TIMESTAMP + 2
      );

      expect(car.isInPit).toBeTruthy();
      expect(car.currentStint).toBeNull();

      expect(car.stints.length).toEqual(1);

      const stint = car.stints[0];
      expect(stint.endTime).toEqual(new Date(ARBITRARY_TIMESTAMP + 2));
      expect(stint.laps.length).toEqual(2);
      // Two laps across the S/F line, plus one in lap (for which the time has
      // not yet been recorded) - so in lap was lap 3
      expect(stint.endLap).toEqual(3);

    });

    it('derives pit stops from stints', () => {

      const car = Car.create({
        raceNum: "42",
        stints: [
          {
            car: "42",
            startLap: 1,
            endLap: 14,
            startTime: 0,
            endTime: 45
          },
          {
            car: "42",
            startLap: 15,
            endLap: 32,
            startTime: 60,
            endTime: 125
          },
          {
            car: "42",
            startLap: 33,
            startTime: 140
          }
        ]
      });

      expect(car.stints.length).toEqual(3);
      expect(car.pitStops.length).toEqual(2);

      const ps1 = car.pitStops[0];
      expect(ps1.startTime).toEqual(new Date(45));
      expect(ps1.endTime).toEqual(new Date(60));
      expect(ps1.durationSeconds).toEqual(0.015); // Not very realistic but Date() takes timestamp with ms!

    });

    it('creates a new stint if necessary at the end of the first lap', () => {
      const colSpec = [
        Stat.NUM,
        Stat.STATE,
        Stat.DRIVER,
        Stat.LAST_LAP
      ];
      const se = new StatExtractor(colSpec);
      const car = Car.create({ raceNum: RACE_NUM });

      expect(car.stints.length).toBe(0);

      const LAPTIME = 123.456;

      car.update(
        se, [ RACE_NUM, 'RUN', 'Shea Adam', ['', ''] ],
        se, [ RACE_NUM, 'RUN', 'Shea Adam', [LAPTIME, ''] ],
        FlagState.GREEN,
        ARBITRARY_TIMESTAMP + LAPTIME
      );

      expect(car.stints.length).toBe(1);
      expect(car.stints[0].inProgress).toBeTruthy();
      expect(car.stints[0].startTime).toEqual(new Date(ARBITRARY_TIMESTAMP));
      expect(car.stints[0].laps.length).toEqual(1);
      expect(car.stints[0].laps[0].laptime).toEqual(LAPTIME);

    });

    it('creates a new finished stint if car pits at end of first lap', () => {
      const colSpec = [
        Stat.NUM,
        Stat.STATE,
        Stat.DRIVER,
        Stat.LAST_LAP
      ];
      const se = new StatExtractor(colSpec);
      const car = Car.create({ raceNum: RACE_NUM });

      expect(car.stints.length).toBe(0);

      car.update(
        se, [ RACE_NUM, 'RUN', 'Shea Adam', ['', ''] ],
        se, [ RACE_NUM, 'PIT', 'Shea Adam', ['', ''] ],
        FlagState.GREEN,
        ARBITRARY_TIMESTAMP,
        ARBITRARY_TIMESTAMP - 60
      );

      expect(car.stints.length).toEqual(1);
      expect(car.stints[0].inProgress).toBeFalsy();
      expect(car.stints[0].laps.length).toEqual(0);
      expect(car.stints[0].startTime).toEqual(new Date(ARBITRARY_TIMESTAMP - 60));
      expect(car.stints[0].endTime).toEqual(new Date(ARBITRARY_TIMESTAMP));
    });

    it('deletes ghost stints on update', () => {

      const colSpec = [
        Stat.NUM,
        Stat.STATE,
        Stat.DRIVER,
        Stat.LAST_LAP
      ];
      const se = new StatExtractor(colSpec);
      const car = Car.create({
        raceNum: RACE_NUM,
        drivers: [
          {
            idx: 0,
            car: RACE_NUM,
            name: 'Paul Truswell'
          }
        ],
        stints: [
          {
            car: RACE_NUM,
            driver: 0,
            startLap: 1,
            startTime: ARBITRARY_TIMESTAMP - 60
          },
          {
            car: RACE_NUM,
            driver: 0,
            startLap: 1,
            startTime: ARBITRARY_TIMESTAMP
          },
        ]
      });

      car.update(
        se, [ RACE_NUM, 'RUN', 'Paul Truswell', ['', ''] ],
        se, [ RACE_NUM, 'RUN', 'Paul Truswell', [123.456, ''] ],
        FlagState.GREEN,
        ARBITRARY_TIMESTAMP + 123.456,
        ARBITRARY_TIMESTAMP - 60
      );

      expect(car.stints.length).toEqual(1);
      expect(car.stints[0].laps[0].laptime).toEqual(123.456);

    });
  }
);
