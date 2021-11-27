import { types } from 'mobx-state-tree';
import { Stat } from '../../racing';

const Driver = types.model({
  idx: types.identifierNumber,
  car: types.reference(types.late(() => Car)),
  name: types.string
});

export const Car = types.model({
  raceNum: types.identifier,
  raceClass: types.union(types.string, types.null, types.undefined),
  teamName: types.union(types.string, types.null, types.undefined),
  make: types.union(types.string, types.null, types.undefined),

  drivers: types.array(Driver)
}).actions(
  self => ({
    update(statExtractor, car) {

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

    }

    // NB We don't need a reset method here; resetting the parent `Cars` collection
    // simply wipes away previous `Car`s
  })
);
