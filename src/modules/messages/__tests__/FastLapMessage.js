import { generateMessages } from '../';
import { Stat } from '@timing71/common';

it('generates car message on personal best lap', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', 'RUN', [124.456, ''], [123.458, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];
  const newCars = [['1', 'RUN', [123.456, 'pb'], [123.456, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][1]).toEqual('Timing');
  expect(msgs[0][2]).toEqual('#1 set a new personal best (2:03.456)');
});

it('generates car message with driver name on personal best lap', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.DRIVER, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', 'RUN', 'John Hindhaugh', [124.456, ''], [123.458, '']], ['2', 'RUN', 'Eve Hewitt', [124.567, ''], [125.678, '']]];
  const newCars = [['1', 'RUN', 'John Hindhaugh', [123.456, 'pb'], [123.456, '']], ['2', 'RUN', 'Eve Hewitt', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) set a new personal best (2:03.456)');
});

it('generates car message on overall best lap', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', 'RUN', [124.456, ''], [123.458, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];
  const newCars = [['1', 'RUN', [123.456, 'sb'], [123.456, 'sb']], ['2', 'RUN', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 set a new overall best (2:03.456)');
});

it('generates car message on consecutive personal best laps', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', 'RUN', [124.456, 'pb'], [123.456, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];
  const newCars = [['1', 'RUN', [123.456, 'pb'], [123.456, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 set a new personal best (2:03.456)');
});

it('generates car message on consecutive overall best laps', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', 'RUN', [124.456, 'sb'], [123.456, 'sb']], ['2', 'RUN', [124.567, ''], [125.678, '']]];
  const newCars = [['1', 'RUN', [123.456, 'sb'], [123.456, 'sb']], ['2', 'RUN', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 set a new overall best (2:03.456)');
});

it('does not generate car message when overall best downgraded to personal best', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', 'RUN', [124.456, 'sb'], [123.456, 'sb']], ['2', 'RUN', [124.567, ''], [125.678, '']]];
  const newCars = [['1', 'RUN', [124.456, 'pb'], [123.456, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(0);
});

it('uses car class as category if present', () => {
  const colSpec = [Stat.NUM, Stat.CLASS, Stat.STATE, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', 'LMDh', 'RUN', [124.456, ''], [123.458, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];
  const newCars = [['1', 'LMDh', 'RUN', [123.456, 'pb'], [123.456, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][1]).toEqual('LMDh');
});

it('uses default category text if car class is an empty string', () => {
  const colSpec = [Stat.NUM, Stat.CLASS, Stat.STATE, Stat.LAST_LAP, Stat.BEST_LAP];

  const oldCars = [['1', '', 'RUN', [124.456, ''], [123.458, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];
  const newCars = [['1', '', 'RUN', [123.456, 'pb'], [123.456, '']], ['2', 'RUN', [124.567, ''], [125.678, '']]];

  const msgs = generateMessages({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][1]).toEqual('Timing');
});
