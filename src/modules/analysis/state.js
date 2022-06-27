import { FlagState } from '@timing71/common';
import { types } from "mobx-state-tree";


const StateSession = types.model({
  timeElapsed: types.optional(types.union(types.undefined, types.number), 0),
  timeRemain: types.optional(types.union(types.undefined, types.number), 0),
  lapsRemain: types.optional(types.union(types.undefined, types.number), undefined),
  flagState: types.optional(types.enumeration(Object.values(FlagState)), FlagState.NONE)
});


export const State = types.model({
  cars: types.optional(types.frozen(), []),
  session: types.optional(StateSession, () => StateSession.create()),
  lastUpdated: types.union(types.Date, types.undefined)
}).actions(
  self => ({
    update(oldState, newState) {
      self.cars = newState.cars;
      self.session = newState.session;
      self.lastUpdated = newState.lastUpdated;
    }
  })
);
