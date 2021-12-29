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
      if (oldState.session?.flagState !== newState.session?.flagState) {
        if (self.flagStats.length > 0) {
          self.flagStats[self.flagStats.length - 1].end(self.leaderLap, newState.lastUpdated);
        }
        self.flagStats.push(
          FlagStat.create({
            flag: newState.session.flagState,
            startTime: newState.lastUpdated,
            startLap: self.leaderLap
          })
        );
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
);
