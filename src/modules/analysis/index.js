import { getSnapshot, types } from 'mobx-state-tree';

import { Session } from './Session';

const Analyser = types.model({
  session: Session
}).actions(
  self => ({
    updateState(oldState, newState) {
      self.session.update(oldState, newState);
      return getSnapshot(self);
    },

    reset() {
      self.session.reset();
    }
  })
);

export const createAnalyser = (initialState={}) => Analyser.create(initialState);
