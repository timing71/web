import { Stat } from '../../../racing';
import { Cars } from '../cars';

const COLUMN_SPEC = [
  Stat.NUM,
  Stat.CLASS,
  Stat.DRIVER,
  Stat.LAPS
];

describe('Cars', () => {

  it('can be reset', () => {
    const cars = Cars.create({ cars: { '44': { raceNum: '44' } } });
    expect(cars.count).toEqual(1);
    cars.reset();
    expect(cars.count).toEqual(0);
  });

  it('creates new Car record when new cars appear', () => {
    const cars = Cars.create();
    expect(cars.count).toEqual(0);

    cars.update(
      { manifest: { colSpec: COLUMN_SPEC }, cars: [ ['1', 'LMP1', 'John Hindhaugh', 33] ] },
      { manifest: { colSpec: COLUMN_SPEC }, cars: [ ['1', 'LMP1', 'John Hindhaugh', 33] ] }
    );
    expect(cars.count).toEqual(1);
    expect(cars.get('1')?.raceNum).toEqual('1');
  });

  it('keeps Car records even if they disappear from race state', () => {
    const cars = Cars.create({ cars: { '44': { raceNum: '44' } } });
    expect(cars.count).toEqual(1);

    cars.update(
      { manifest: { colSpec: COLUMN_SPEC }, cars: [ ['44', 'LMP1', 'John Hindhaugh', 33] ] },
      { manifest: { colSpec: COLUMN_SPEC }, cars: [] }
    );
    expect(cars.count).toEqual(1);
    expect(cars.get('44')?.raceNum).toEqual('44');
  });

});
