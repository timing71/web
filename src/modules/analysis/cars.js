import { Stat, StatExtractor } from '@timing71/common';
import { types } from 'mobx-state-tree';
import { Car } from './car';

export const Cars = types.model({
  cars: types.map(Car)
}).actions(
  self => ({
    update(oldState, newState) {

      if (newState.manifest?.colSpec) {
        const statExtractor = new StatExtractor(newState.manifest.colSpec);

        const currentFlag = newState.session?.flagState;

        (newState.cars || []).forEach(
          car => {
            const raceNum = statExtractor.get(car, Stat.NUM);
            if (raceNum) {
              if (!self.cars.get(raceNum)) {
                self.cars.set(raceNum, { raceNum });
              }

              const oldStatExtractor = new StatExtractor(oldState.manifest.colSpec);
              const oldCar = oldStatExtractor.findCarInList(car, oldState.cars);

              self.cars.get(raceNum).update(
                oldStatExtractor,
                oldCar,
                statExtractor,
                car,
                currentFlag,
                newState.lastUpdated,
                newState.manifest.startTime
              );
            }
          }
        );
      }

    },

    reset() {
      self.cars = {};
    }
  })
).views(
  self => ({
    get count() {
      return self.cars.size;
    },

    get(raceNum) {
      return self.cars.get(raceNum);
    },

    map(func) {
      return self.toArray.map(func);
    },

    get toArray() {
      return [...self.cars.values()];
    },

    get perState() {
      return self.toArray.reduce(
        (accum, car) => {
          accum[car.state] = (accum[car.state] || 0) + 1;
          return accum;
        },
        {}
      );
    }

  })
);
