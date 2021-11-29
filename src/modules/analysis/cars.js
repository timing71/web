import { types } from 'mobx-state-tree';
import { Car } from './car';
import { StatExtractor } from '../../statExtractor';
import { Stat } from '../../racing';

export const Cars = types.model({
  cars: types.map(Car)
}).actions(
  self => ({
    update(oldState, newState) {

      if (newState.service?.colSpec) {
        const statExtractor = new StatExtractor(newState.service.colSpec);

        const currentFlag = newState.session?.flagState;

        newState.cars.forEach(
          car => {
            const raceNum = statExtractor.get(car, Stat.NUM);
            if (!self.cars[raceNum]) {
              self.cars.set(raceNum, Car.create({ raceNum }));
            }

            const oldStatExtractor = new StatExtractor(oldState.service.colSpec);
            const oldCar = oldStatExtractor.findCarInList(car, oldState.cars);

            self.cars.get(raceNum).update(
              oldStatExtractor,
              oldCar,
              statExtractor,
              car,
              currentFlag,
              newState.timestamp
            );
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
    }
  })
);
