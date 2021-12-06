import { getSnapshot, types } from 'mobx-state-tree';
import { Cars } from './cars';

import { Messages } from './messages';
import { Session } from './session';

const Analyser = types.model({
  cars: types.optional(Cars, () => Cars.create()),
  messages: types.optional(Messages, () => Messages.create()),
  session: types.optional(Session, () => Session.create())
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

export const createAnalyser = (initialState) => Analyser.create(initialState);
