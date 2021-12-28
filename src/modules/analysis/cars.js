import { types } from 'mobx-state-tree';
import { Car } from './car';
import { StatExtractor } from '../../statExtractor';
import { Stat } from '../../racing';

export const Cars = types.model({
  cars: types.map(Car)
}).actions(
  self => ({
    update(oldState, newState) {

      if (newState.manifest?.colSpec) {
        const statExtractor = new StatExtractor(newState.manifest.colSpec);

        const currentFlag = newState.session?.flagState;

        newState.cars.forEach(
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
                newState.lastUpdated
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
      return [...self.cars.values()].map(func);
    }

  })
);
