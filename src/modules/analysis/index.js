import { types } from 'mobx-state-tree';

import { Session } from './Session';
import { State } from './state';

const Analyser = types.model({
  session: Session,
  state: State
}).actions(
  self => ({
    updateState(newState) {
      self.session.update(self.state, newState);

      self.state = newState;
    }
  })
);

export const createAnalyser = (initialState={}) => Analyser.create(initialState);
