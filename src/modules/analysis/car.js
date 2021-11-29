import { types } from 'mobx-state-tree';
import { FlagState, Stat } from '../../racing';

const Driver = types.model({
  idx: types.identifierNumber,
  car: types.reference(types.late(() => Car)),
  name: types.string
});

const Lap = types.model({
  lapNumber: types.integer,
  laptime: types.number,
  driver: types.reference(Driver),
  flag: types.optional(types.string, FlagState.NONE),
  timestamp: types.Date
});

export const Stint = types.model({
  startLap: types.integer,
  startTime: types.Date,
  endLap: types.union(types.integer, types.undefined),
  endTime: types.union(types.Date, types.undefined),
  driver: types.reference(Driver),
  laps: types.array(Lap)
}).actions(
  self => ({
    start(lap, time) {
      self.startLap = lap;
      self.startTime = time;
    },

    addLap(lap) {
      self.laps.push(lap);
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
    }
  })
);

const FLAG_WEIGHTS = {
  [FlagState.NONE]: -1,
  [FlagState.GREEN]: 0,
  [FlagState.YELLOW]: 1,
  [FlagState.SLOW_ZONE]: 2,
  [FlagState.CODE_60_ZONE]: 3,
  [FlagState.FCY]: 4,
  [FlagState.VSC]: 4,
  [FlagState.CODE_60]: 5,
  [FlagState.RED]: 99
};

const FLAG_WEIGHTS_INVERSE = Object.fromEntries(Object.entries(FLAG_WEIGHTS).map(a => a.reverse()));


export const Car = types.model({
  raceNum: types.identifier,
  raceClass: types.union(types.string, types.null, types.undefined),
  teamName: types.union(types.string, types.null, types.undefined),
  make: types.union(types.string, types.null, types.undefined),

  drivers: types.array(Driver),

  currentLap: types.optional(types.integer, 1),

  stints: types.array(Stint),
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
        timestamp
      });

      if (self.stints.length === 0) {
        self.stints.push(
          Stint.create({
            startLap: self.currentLap,
            startTime: timestamp,
            driver
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

      const maybeLapCount = statExtractor.get(car, Stat.LAPS);
      if (maybeLapCount) {
        self.currentLap = maybeLapCount + 1;
      }

      const newLastLap = statExtractor.get(car, Stat.LAST_LAP, []);
      if (oldStatExtractor && oldCar) {
        const oldLastLap = oldStatExtractor.get(oldCar, Stat.LAST_LAP, []);

        if (newLastLap[0] && (!oldLastLap || oldLastLap[0] !== newLastLap[0]) ) {
          self.recordNewLap(newLastLap[0], currentDriver, self.highestSeenFlagThisLap, timestamp);
        }
      }
      else if (newLastLap[0]) {
        // We didn't appear in the previous state; if we have a last laptime
        // we should record it.
        self.recordNewLap(newLastLap[0], currentDriver, self.highestSeenFlagThisLap, timestamp);
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
