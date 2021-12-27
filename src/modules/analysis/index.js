import { onPatch, onSnapshot, types } from 'mobx-state-tree';
import { useRef, useEffect, useContext } from 'react';

import { Cars } from './cars';
import { Messages } from './messages';
import { Session } from './session';

import { migrateAnalysisState } from './migrate';
import { PluginContext } from '../pluginBridge';
import { useServiceState } from '../../components/ServiceContext';
import { useBroadcastChannel } from '../../broadcastChannel';

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

export const Analysis = ({ serviceUUID }) => {

  const port = useContext(PluginContext);
  const { state } = useServiceState();
  const { emit } = useBroadcastChannel(`analysis/${serviceUUID}`);

  const analyser = useRef(createAnalyser());
  const prevState = useRef(state);

  const latestSnapshot = useRef();

  useEffect(
    () => {
      if (analyser.current) {

        onSnapshot(
          analyser.current,
          (state) => {
            latestSnapshot.current = state;
            try {
              port.send({
                type: 'UPDATE_SERVICE_ANALYSIS',
                analysis: state,
                uuid: serviceUUID,
                timestamp: state.lastUpdated
              });
            }
            catch (error) {
              // sometimes we end up with a disconnected port here
            }
          }
        );

        onPatch(
          analyser.current,
          (p) => {
            emit({ type: 'ANALYSIS_DELTA', data: p });
          }
        );
      }
    },
    [emit, port, serviceUUID]
  );

  useEffect(
    () => {
      const keyframeInterval = setInterval(
        () => {
          latestSnapshot.current && emit({ type: 'ANALYSIS_STATE', data: latestSnapshot.current });
        },
        60000
      );

      return () => {
        clearInterval(keyframeInterval);
      };
    },
    [emit]
  );

  useEffect(
    () => {
      analyser.current?.updateState(
        prevState.current,
        state
      );

      prevState.current = state;
    },
    [port, serviceUUID, state]
  );

  return null;
};
