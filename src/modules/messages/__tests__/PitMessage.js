import { generateMessages } from '../';
import { Stat } from '@timing71/common';

it('generates car message on pit in', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'RUN', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'PIT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = generateMessages({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has entered the pits');
});

it('generates car message on pit out', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'PIT', 'LMP1', 'John Hindhaugh'], ['2', 'PIT', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'OUT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = generateMessages({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(2);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has left the pits');
  expect(msgs[1][2]).toEqual('#2 (Eve Hewitt) has left the pits');
});
