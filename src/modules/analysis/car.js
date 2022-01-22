import { types } from 'mobx-state-tree';
import { FlagState, Stat } from '../../racing';

const Driver = types.model({
  idx: types.identifierNumber,
  car: types.reference(types.late(() => Car)),
  name: types.string
}).views(
  self => ({
    get stints() {
      return self.car.stints.filter(s => s.driver === self);
    }
  })
);

const Lap = types.model({
  lapNumber: types.integer,
  laptime: types.number,
  driver: types.union(
    types.reference(Driver, {
      get(identifier, parent) {
        return parent.car.drivers[identifier];
      },
      set(value) {
        return value.idx;
      }
    }),
    types.undefined
  ),
  flag: types.optional(types.string, FlagState.NONE),
  timestamp: types.Date,
  car: types.reference(types.late(() => Car))
});

const FLAG_WEIGHTS = {
  [FlagState.NONE]: -1,
  [FlagState.GREEN]: 0,
  [FlagState.YELLOW]: 1,
  [FlagState.SLOW_ZONE]: 2,
  [FlagState.CODE_60_ZONE]: 3,
  [FlagState.FCY]: 4,
  [FlagState.VSC]: 5,
  [FlagState.CODE_60]: 6,
  [FlagState.SC]: 7,
  [FlagState.RED]: 99
};

export const Stint = types.model({
  startLap: types.integer,
  startTime: types.Date,
  endLap: types.union(types.integer, types.undefined),
  endTime: types.union(types.Date, types.undefined),
  car: types.reference(types.late(() => Car)),
  driver: types.union(
    types.reference(Driver, {
      get(identifier, parent) {
        return parent.car.drivers[identifier];
      },
      set(value) {
        return value.idx;
      }
    }),
    types.undefined
  ),
  laps: types.array(Lap)
}).actions(
  self => ({
    start(lap, time) {
      self.startLap = lap;
      self.startTime = time;
    },

    addLap(lap) {
      self.laps.push(lap);
      self.driver = lap.driver;
    },

    end(lap, time) {
      self.endLap = lap;
      self.endTime = time;
    }
  })
).views(
  self => ({
    get inProgress() {
      return !self.endLap && !self.endTime;
    },
    get durationSeconds() {
      return self.endTime ? (self.endTime - self.startTime) / 1000 : null;
    },
    get durationLaps() {
      return self.endLap ? 1 + self.endLap - self.startLap : null;
    },
    get relevantLaps() {
      return self.laps.slice(1, self.inProgress ? undefined : -1); // ignore out and in laps
    },
    get bestLap() {
      return self.relevantLaps.length > 0 ?
        Math.min(
          ...self.relevantLaps.map(l => l.laptime)
        )
      : null;
    },
    get meanLap() {
      const greenLaps = self.relevantLaps.filter(l => l.flag === FlagState.GREEN);
      return greenLaps.length > 0 ?
      (greenLaps.map(l => l.laptime).reduce((sum, val) => sum + val, 0) / greenLaps.length).toFixed(3)
    : null;
    },
    get yellowLaps() {
      return self.relevantLaps.filter(l => FLAG_WEIGHTS[l.flag] >= FLAG_WEIGHTS[FlagState.YELLOW]).length;
    }
  })
);

const FLAG_WEIGHTS_INVERSE = Object.fromEntries(Object.entries(FLAG_WEIGHTS).map(a => a.reverse()));

const IN_PIT_STATES = ['PIT', 'FUEL'];

export const Car = types.model({
  raceNum: types.identifier,
  raceClass: types.union(types.string, types.null, types.undefined),
  teamName: types.union(types.string, types.null, types.undefined),
  make: types.union(types.string, types.null, types.undefined),

  drivers: types.array(Driver),

  currentLap: types.optional(types.integer, 1),

  stints: types.array(Stint),
  state: types.union(types.string, types.null, types.undefined),
  isInPit: types.optional(types.boolean, true),

  highestSeenFlagThisLap: types.optional(types.integer, 0)
}).actions(
  self => ({

    recordNewLap(laptime, driver, flag, timestamp) {
      const newLap = Lap.create({
        lapNumber: self.currentLap,
        laptime,
        driver,
        flag: FLAG_WEIGHTS_INVERSE[flag] || FlagState.NONE,
        timestamp,
        car: self
      });

      if (self.stints.length === 0) {
        self.stints.push(
          Stint.create({
            startLap: self.currentLap,
            startTime: timestamp,
            driver,
            car: self
          })
        );
      }

      self.stints[self.stints.length - 1].addLap(newLap);
      self.highestSeenFlagThisLap = 0;

    },

    update(oldStatExtractor, oldCar, statExtractor, car, currentFlag, timestamp) {

      const currentDriverName = statExtractor.get(car, Stat.DRIVER);
      let currentDriver = self.drivers.find( d => d.name === currentDriverName );
      if (!!currentDriverName && !currentDriver) {
        currentDriver = Driver.create({
          idx: self.drivers.length,
          car: self,
          name: currentDriverName
        });
        self.drivers.push(currentDriver);
      }

      // We assume these things don't change mid-session!
      if (!self.raceClass) {
        self.raceClass = statExtractor.get(car, Stat.CLASS);
      }
      if (!self.teamName) {
        self.teamName = statExtractor.get(car, Stat.TEAM);
      }
      if (!self.make) {
        self.make = statExtractor.get(car, Stat.CAR);
      }

      self.highestSeenFlagThisLap = Math.max(
        self.highestSeenFlagThisLap,
        FLAG_WEIGHTS[currentFlag] || 0
      );

      const currentState = statExtractor.get(car, Stat.STATE);
      self.state = currentState;
      const currentStateIsPit = IN_PIT_STATES.includes(currentState);
      const prevState = oldCar && oldStatExtractor?.get(oldCar, Stat.STATE);
      const prevStateIsPit = IN_PIT_STATES.includes(prevState);

      if (currentStateIsPit && !prevStateIsPit && self.currentStint) {
        self.currentStint.end(self.currentLap, timestamp);
      }
      else if (!currentStateIsPit && prevStateIsPit) {
        self.stints.push(
          Stint.create({
            startLap: self.currentLap,
            startTime: timestamp,
            driver: currentDriver,
            car: self
          })
        );
      }

      let fudgeLapCount = false;

      const maybeLapCount = statExtractor.get(car, Stat.LAPS, null);
      if (maybeLapCount !== null && Number.isInteger(maybeLapCount)) {
        self.currentLap = maybeLapCount + 1;
      }
      else {
        fudgeLapCount = true;
      }

      self.isInPit = IN_PIT_STATES.includes(currentState);

      const newLastLap = statExtractor.get(car, Stat.LAST_LAP, []);
      if (oldStatExtractor && oldCar) {
        const oldLastLap = oldStatExtractor.get(oldCar, Stat.LAST_LAP, []);

        if (newLastLap[0] && (!oldLastLap || oldLastLap[0] !== newLastLap[0]) ) {
          self.recordNewLap(newLastLap[0], currentDriver, self.highestSeenFlagThisLap, timestamp);
          if (fudgeLapCount) {
            self.currentLap++;
          }
        }
      }
      else if (newLastLap[0]) {
        // We didn't appear in the previous state; if we have a last laptime
        // we should record it.
        self.recordNewLap(newLastLap[0], currentDriver, self.highestSeenFlagThisLap, timestamp);
        if (fudgeLapCount) {
          self.currentLap++;
        }
      }

    },

    // NB We don't need a reset method here; resetting the parent `Cars` collection
    // simply wipes away previous `Car`s
  })
).views(
  self => ({
    get currentStint() {
      if (self.stints.length > 0) {
        if (self.stints[self.stints.length - 1].inProgress) {
          return self.stints[self.stints.length - 1];
        }
      }
      return null;
    }
  })
);
