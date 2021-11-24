import { getSnapshot, types } from 'mobx-state-tree';

import { Session } from './Session';

const Analyser = types.model({
  session: Session
}).actions(
  self => ({
    updateState(oldState, newState) {
      self.session.update(oldState, newState);
      return getSnapshot(self);
    }
  })
);

export const createAnalyser = (initialState={}) => Analyser.create(initialState);
