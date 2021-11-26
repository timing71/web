import { getSnapshot, types } from 'mobx-state-tree';
import { Cars } from './cars';

import { Messages } from './Messages';
import { Session } from './Session';

const Analyser = types.model({
  cars: Cars,
  messages: Messages,
  session: Session
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

export const createAnalyser = (initialState={}) => Analyser.create(initialState);
