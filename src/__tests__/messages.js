import { generateMessages } from '../messages';
import { FlagState, Stat } from '../racing';

const FLAG_EXPECTATIONS = [
  [FlagState.GREEN, FlagState.YELLOW, 'Yellow flags shown'],
  [FlagState.GREEN, FlagState.SC, 'Safety car deployed'],
  [FlagState.GREEN, FlagState.VSC, 'Virtual safety car deployed'],
  [FlagState.GREEN, FlagState.RED, 'Red flag'],
  [FlagState.RED, FlagState.GREEN, 'Green flag - track clear'],
  [FlagState.CODE_60, FlagState.CHEQUERED, 'Chequered flag'],
];

FLAG_EXPECTATIONS.forEach(
  ([from, to, message]) => {
    it(
      `generates flag message from ${from} to ${to}`,
      () => {
        const msgs = generateMessages(
          {},
          { session: { flagState: from } },
          { session: { flagState: to } },
        );
        expect(msgs.length).toEqual(1);
        expect(msgs[0][2]).toEqual(message);
      }
    );
  }
);

it('generates car message on pit in', () => {
  const columnSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'RUN', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'PIT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = generateMessages({ columnSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has entered the pits');
});

it('generates car message on pit out', () => {
  const columnSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'PIT', 'LMP1', 'John Hindhaugh'], ['2', 'PIT', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'OUT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = generateMessages({ columnSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(2);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has left the pits');
  expect(msgs[1][2]).toEqual('#2 (Eve Hewitt) has left the pits');
});
