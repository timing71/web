import { FlagState, Stat } from "../../racing";
import { StatExtractor } from '../../statExtractor';

const MIGRATIONS = {
  1: (oldState) => {

    const migrated = {
      cars: { cars: {} },
      session: {},
      messages: {},
      manifest: oldState.service
    };

    const INVERSE_FLAG_MAP = {
      0: FlagState.NONE,
      1: FlagState.GREEN,
      2: FlagState.WHITE,
      3: FlagState.CHEQUERED,
      4: FlagState.YELLOW,
      5: FlagState.FCY,
      6: FlagState.CODE_60,
      7: FlagState.VSC,
      8: FlagState.SC,
      9: FlagState.CAUTION,
      10: FlagState.RED,
      11: FlagState.SLOW_ZONE,
      12: FlagState.CODE_60_ZONE
    };

    const se = new StatExtractor(oldState.service.colSpec);

    Object.entries(oldState.static).forEach(
      ([raceNum, [raceClass, teamName, make]]) => {

        const drivers = oldState.driver[raceNum].map((d, idx) => ({ idx, name: d, car: raceNum }));

        const stints =
          [
            ...oldState.stint[raceNum],
            oldState.lap[raceNum][0]
          ].filter(
            s => !!s
          ).map(
          s => {
            let cumulativeTime = s[1];
            return {
              startLap: s[0],
              startTime: s[1] * 1000,
              endLap: s[2],
              endTime: s[3] ? s[3] * 1000 : undefined,
              driver: s[5],
              car: raceNum,
              laps: s[9].map(
                ([laptime, flag], idx) => {
                  cumulativeTime += laptime * 1000;
                  return {
                    lapNumber: s[0] + idx,
                    laptime,
                    driver: s[5],
                    flag: INVERSE_FLAG_MAP[flag],
                    car: raceNum,
                    timestamp: cumulativeTime // NB this is APPROXIMATE as this value was not stored in the v1 file
                  };
                }
              )
            };
          }
        );

        migrated.cars.cars[raceNum] = {
          raceNum,
          raceClass,
          teamName,
          make,
          drivers,
          stints
        };
      }
    );

    oldState.state.cars.forEach(
      oldCar => {
        const num = se.get(oldCar, Stat.NUM);
        const state = se.get(oldCar, Stat.STATE, '???');
        migrated.cars.cars[num].state = state;
      }
    );

    migrated.session = {
      leaderLap: oldState.session.leaderLap,
      flagStats: oldState.session.flagStats.map(
        stat => ({
          flag: INVERSE_FLAG_MAP[stat[0]],
          startLap: stat[1],
          startTime: stat[2] * 1000,
          endLap: stat[3] || undefined,
          endTime: stat[4] ? stat[4] * 1000 : undefined
        })
      )
    };

    migrated.messages.messages = Object.values(
      oldState['car_messages']
    ).flat().concat(
      oldState.messages.messages
    ).sort(
      (a, b) => b[0] - a[0]
    ).map(
      msg => ({
        category: msg[1],
        message: msg[2],
        style: msg[3] || '',
        carNum: msg[4],
        timestamp: msg[0] * 1000
      })
    );

    migrated.latestTimestamp = oldState.session.currentTimestamp * 1000;

    migrated.state = oldState.state;

    return migrated;

  }
};

export const migrateAnalysisState = (oldState) => {

  const priorVersion = oldState.version || 1;

  if (MIGRATIONS[priorVersion]) {
    return MIGRATIONS[priorVersion](oldState);
  }
  else {
    throw new Error(`Unable to migrate from analysis version ${priorVersion}`);
  }
};
