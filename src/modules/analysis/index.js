import { Stat, StatExtractor } from '@timing71/common';
import { types } from 'mobx-state-tree';

import { Cars } from './cars';
import { Messages } from './messages';
import { Session } from './session';

import { CURRENT_VERSION, migrateAnalysisState } from './migrate';

import { State } from './state';
import { Manifest } from './manifest';

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

          if (newState?.manifest && oldState?.manifest) {
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
          ).filter(
            c => !!c  // Not sure why this sometimes happens - perhaps a race
                      // condition where we haven't fully loaded data yet?
          );
        },

        get knownCarClasses() {
          const se = new StatExtractor(self.manifest.colSpec);
          return [
            ...new Set(
              self.state.cars.map(
                c => se.get(c, Stat.CLASS)
              ).filter( c => !!c )
            )
          ];
        }
      }
    };

  });

export const createAnalyser = (initialState, live) => {
  if (initialState === undefined || initialState === null || initialState?.version === CURRENT_VERSION) {
    const a = Analyser.create(initialState || undefined);
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
