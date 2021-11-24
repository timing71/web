import { getSnapshot, types } from 'mobx-state-tree';

import { Messages } from './Messages';
import { Session } from './Session';

const Analyser = types.model({
  messages: Messages,
  session: Session
}).actions(
  self => ({
    updateState(oldState, newState) {
      self.messages.update(oldState, newState);
      self.session.update(oldState, newState);
      return getSnapshot(self);
    },

    reset() {
      self.messages.reset();
      self.session.reset();
    }
  })
);

export const createAnalyser = (initialState={}) => Analyser.create(initialState);
