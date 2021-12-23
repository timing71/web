import { getSnapshot, types } from 'mobx-state-tree';
import { Cars } from './cars';

import { Messages } from './messages';
import { Session } from './session';

import { migrateAnalysisState } from './migrate';

const CURRENT_VERSION = 2;

const Analyser = types.model({
  cars: types.optional(Cars, () => Cars.create()),
  messages: types.optional(Messages, () => Messages.create()),
  session: types.optional(Session, () => Session.create()),
  version: types.optional(types.literal(CURRENT_VERSION), CURRENT_VERSION)
}).actions(
  self => ({
    updateState(oldState, newState) {
      self.cars.update(oldState, newState);
      self.messages.update(oldState, newState);
      self.session.update(oldState, newState);
      return getSnapshot(self);
    },

    reset() {
      self.cars.reset();
      self.messages.reset();
      self.session.reset();
    }
  })
);

export const createAnalyser = (initialState) => {
  if (initialState === undefined || initialState.version === CURRENT_VERSION ) {
    return Analyser.create(initialState);
  }
  else if ((initialState.version || 0) < CURRENT_VERSION) {
    return Analyser.create(
      migrateAnalysisState(initialState)
    );
  }
};
