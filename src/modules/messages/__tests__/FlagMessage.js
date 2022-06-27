import { generateMessages } from '../';
import { FlagState } from '@timing71/common';

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
