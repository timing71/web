import { types } from 'mobx-state-tree';

export const State = types.model({
  cars: types.array(),
  session: types.map(),
  messages: types.array()
});
