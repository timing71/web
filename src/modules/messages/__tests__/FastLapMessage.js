import { generateMessages } from '../';
import { Stat } from '../../../racing';

it('generates car message on personal best lap', () => {
  const columnSpec = [Stat.NUM, Stat.STATE, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', 'RUN', [124.456, ''], [123.458, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];
  const newCars = [['1', 'RUN', [123.456, 'pb'], [123.456, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ columnSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 set a new personal best (2:03.456)');
});

it('generates car message with driver name on personal best lap', () => {
  const columnSpec = [Stat.NUM, Stat.STATE, Stat.DRIVER, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', 'RUN', 'John Hindhaugh', [124.456, ''], [123.458, '']], ['2', 'RUN', 'Eve Hewitt', [124.567, ''], [125.678, '']]];
  const newCars = [['1', 'RUN', 'John Hindhaugh', [123.456, 'pb'], [123.456, '']], ['2', 'RUN', 'Eve Hewitt', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ columnSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) set a new personal best (2:03.456)');
});

it('generates car message on overall best lap', () => {
  const columnSpec = [Stat.NUM, Stat.STATE, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', 'RUN', [124.456, ''], [123.458, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];
  const newCars = [['1', 'RUN', [123.456, 'sb'], [123.456, 'sb']], ['2', 'RUN', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ columnSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 set a new overall best (2:03.456)');
});

it('generates car message on consecutive personal best laps', () => {
  const columnSpec = [Stat.NUM, Stat.STATE, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', 'RUN', [124.456, 'pb'], [123.456, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];
  const newCars = [['1', 'RUN', [123.456, 'pb'], [123.456, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ columnSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 set a new personal best (2:03.456)');
});

it('generates car message on consecutive overall best laps', () => {
  const columnSpec = [Stat.NUM, Stat.STATE, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', 'RUN', [124.456, 'sb'], [123.456, 'sb']], ['2', 'RUN', [124.567, ''], [125.678, '']]];
  const newCars = [['1', 'RUN', [123.456, 'sb'], [123.456, 'sb']], ['2', 'RUN', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ columnSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 set a new overall best (2:03.456)');
});
