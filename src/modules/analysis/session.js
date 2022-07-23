import { types } from 'mobx-state-tree';

const FlagStat = types.model({
  flag: types.string,
  startTime: types.Date,
  startLap: types.integer,
  endTime: types.union(types.Date, types.undefined),
  endLap: types.union(types.integer, types.undefined)
}).actions(
  self => ({
    end(endLap, endTime) {
      self.endLap = endLap;
      self.endTime = endTime;
    }
  })
).views(
  self => ({
    get lapsDuration() {
      if (self.endLap) {
        return self.endLap - self.startLap;
      }
      return undefined;
    },

    get secondsDuration() {
      if (self.endTime) {
        return Math.ceil((self.endTime - self.startTime) / 1000);
      }
      return undefined;
    }
  })
);

export const Session = types.model({
  flagStats: types.array(FlagStat),
  leaderLap: types.optional(types.integer, 0)
}).actions(
  self => ({
    update(oldState, newState) {
      if (newState.session?.flagState) {
        if (oldState.session?.flagState !== newState.session.flagState || self.flagStats.length === 0) {
          if (self.flagStats.length > 0) {
            self.flagStats[self.flagStats.length - 1].end(self.leaderLap, newState.lastUpdated);
          }
          self.flagStats.push(
            FlagStat.create({
              flag: newState.session.flagState,
              startTime: self.flagStats.length === 0 && oldState.lastUpdated ? oldState.lastUpdated : newState.lastUpdated,
              startLap: self.leaderLap
            })
          );
        }
      }
    },

    setLeaderLap(laps) {
      self.leaderLap = laps;
    },

    reset() {
      self.flagStats = [];
      self.leaderLap = 0;
    }
  })
).views(
  self => ({
    get aggregateFlagStats() {
      return self.flagStats.reduce(
        (agg, stat) => {
          if (stat.endTime) {
            if (agg[stat.flag]) {
              const prev = agg[stat.flag];
              agg[stat.flag] = {
                count: prev.count + 1,
                time: prev.time + (stat.endTime - stat.startTime),
                laps: prev.laps + ((stat.endLap || stat.startLap) - stat.startLap)
              };
            }
            else {
              agg[stat.flag] = {
                count: 1,
                time: stat.endTime - stat.startTime,
                laps: (stat.endLap || stat.startLap) - stat.startLap
              };
            }
          }
          else {
            if (agg[stat.flag]) {
              const prev = agg[stat.flag];
              agg[stat.flag] = {
                count: prev.count + 1,
                time: prev.time,
                laps: prev.laps,
                additionalTimeFrom: stat.startTime,
                additionalLapsFrom: stat.startLap
              };
            }
            else {
              agg[stat.flag] = {
                count: 1,
                time: 0,
                laps: 0,
                additionalTimeFrom: stat.startTime,
                additionalLapsFrom: stat.startLap
              };
            }
          }

          return agg;
        },
        {}
      );
    }
  })
);
