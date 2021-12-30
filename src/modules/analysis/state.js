import { types } from "mobx-state-tree";

import { FlagState } from '../../racing';

const StateSession = types.model({
  timeElapsed: types.optional(types.union(types.undefined, types.number), 0),
  timeRemain: types.optional(types.union(types.undefined, types.number), 0),
  lapsRemain: types.optional(types.union(types.undefined, types.number), 0),
  flagState: types.optional(types.enumeration(Object.values(FlagState)), FlagState.NONE)
});

const StateCars = types.array(types.frozen(types.array));

export const State = types.model({
  cars: types.optional(StateCars, () => StateCars.create()),
  session: types.optional(StateSession, () => StateSession.create())
}).actions(
  self => ({
    update(oldState, newState) {
      self.cars = newState.cars;
      self.session = newState.session;
    }
  })
);
