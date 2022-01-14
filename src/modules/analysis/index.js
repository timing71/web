import { onPatch, onSnapshot, types } from 'mobx-state-tree';
import { useRef, useEffect, useContext } from 'react';

import { Cars } from './cars';
import { Messages } from './messages';
import { Session } from './session';

import { migrateAnalysisState } from './migrate';
import { PluginContext } from '../pluginBridge';
import { useServiceState } from '../../components/ServiceContext';
import { useBroadcastChannel } from '../../broadcastChannel';
import { State } from './state';
import { Manifest } from './manifest';
import { StatExtractor } from '../../statExtractor';
import { Stat } from '../../racing';

const CURRENT_VERSION = 2;

const MIN_LAPS_REQUIRED_FOR_PREDICTION = 10;

const Analyser = types.model({
  cars: types.optional(Cars, () => Cars.create()),
  messages: types.optional(Messages, () => Messages.create()),
  session: types.optional(Session, () => Session.create()),
  state: types.optional(State, () => State.create()),
  manifest: types.optional(Manifest, () => Manifest.create()),
  latestTimestamp: types.optional(types.Date, () => new Date()),
  version: types.optional(types.literal(CURRENT_VERSION), CURRENT_VERSION)
}).extend(
  self => {

    let liveMode = false;

    return {
      actions: {
        updateState: (oldState, newState, timestamp) => {
          self.cars.update(oldState, newState);
          self.messages.update(oldState, newState);
          self.session.update(oldState, newState);

          self.state.update(oldState, newState);
          self.manifest = newState.manifest;

          self.latestTimestamp = timestamp || new Date();

          const maxLap = Math.max(...self.cars.map(c => c.currentLap));
          if (maxLap > 0) {
            self.session.setLeaderLap(maxLap);
          }

        },

        reset: () => {
          self.cars.reset();
          self.messages.reset();
          self.session.reset();
        },

        setLive(isLive) {
          liveMode = isLive;
        }
      },
      views: {
        get distancePrediction() {
          const { timeElapsed, timeRemain, lapsRemain } = self.state.session;
          const leaderLap = self.session.leaderLap;
          const now = Date.now();
          const timeDelta = now - self.latestTimestamp;
          const lapsPerSecond = (leaderLap - 1) / (timeElapsed - (timeDelta / 1000));

          if (lapsRemain) {
            return {
              laps: {
                value: Math.max(0, lapsRemain),
                predicted: false
              },
              time: {
                value: leaderLap < MIN_LAPS_REQUIRED_FOR_PREDICTION ?
                  timeRemain ?
                    Math.max(0, timeRemain) :
                    timeRemain :
                  Math.max(0, timeRemain || (lapsRemain / lapsPerSecond)),
                predicted: !!timeRemain
              }
            };
          }
          if (timeRemain !== undefined) {
            return {
              laps: {
                value: leaderLap < MIN_LAPS_REQUIRED_FOR_PREDICTION ?
                  null :
                  Math.max(0, Math.ceil(timeRemain * lapsPerSecond)) - 1,
                predicted: true
              },
              time: {
                value: Math.max(0, timeRemain),
                predicted: false
              }
            };
          }

          return null;
        },

        get live() {
          return liveMode;
        },

        referenceTimestamp() {
          return liveMode ? new Date() : self.latestTimestamp;
        },

        get carsInRunningOrder() {
          const se = new StatExtractor(self.manifest.colSpec);
          return self.state.cars.map(
            c => self.cars.get(se.get(c, Stat.NUM))
          );
        }
      }
    };

  });

export const createAnalyser = (initialState, live) => {
  if (initialState === undefined || initialState?.version === CURRENT_VERSION) {
    const a = Analyser.create(initialState);
    a.setLive(live);
    return a;
  }
  else if ((initialState.version || 0) < CURRENT_VERSION) {
    const a = Analyser.create(
      migrateAnalysisState(initialState)
    );
    a.setLive(live);
    return a;
  }
};

export const Analysis = ({ analysisState, live=false, serviceUUID }) => {

  const port = useContext(PluginContext);
  const { state } = useServiceState();
  const { emit } = useBroadcastChannel(`analysis/${serviceUUID}`);

  const analyser = useRef();
  if (!analyser.current) {
    analyser.current = createAnalyser(analysisState, live);
  }
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
