import { Stat } from '../../../racing';
import { StatExtractor } from '../../../statExtractor';
import { Car } from '../car';

const COLUMN_SPEC = [
  Stat.NUM,
  Stat.CLASS,
  Stat.DRIVER,
  Stat.LAPS
];

const statExtractor = new StatExtractor(COLUMN_SPEC);

const RACE_NUM = '42';

describe(
  'Car',
  () => {
    it('keeps a list of drivers', () => {

      const car = Car.create({ raceNum: RACE_NUM });
      expect(car.drivers.length).toEqual(0);

      car.update(
        statExtractor,
        [ RACE_NUM, 'clazz', 'John Hindhaugh', 1 ]
      );

      expect(car.drivers.length).toEqual(1);
      expect(car.drivers[0].name).toEqual('John Hindhaugh');

      car.update(
        statExtractor,
        [ RACE_NUM, 'clazz', 'Eve Hewitt', 1 ]
      );

      expect(car.drivers.length).toEqual(2);
      expect(car.drivers[1].name).toEqual('Eve Hewitt');

      car.update(
        statExtractor,
        [ RACE_NUM, 'clazz', 'John Hindhaugh', 1 ]
      );
      // We don't add a duplicate entry
      expect(car.drivers.length).toEqual(2);

    });
  }
);
