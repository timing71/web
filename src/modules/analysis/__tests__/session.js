import { FlagState } from "@timing71/common";
import { Session } from "../session";

describe('Session', () => {
  it('records changes in flag state', () => {
    const session = Session.create();

    const oldState = {
      lastUpdated: 1000,
      session: {
        flagState: FlagState.GREEN
      }
    };

    const newState = {
      lastUpdated: 5000,
      session: {
        flagState: FlagState.YELLOW
      }
    };

    session.update(oldState, oldState);
    session.update(oldState, newState);

    expect(session.flagStats.length).toEqual(2);
    let flagStat = session.flagStats[1];
    expect(flagStat.flag).toEqual(FlagState.YELLOW);
    expect(flagStat.startTime).toEqual(new Date(5000));
    expect(flagStat.endTime).toBeUndefined();
    expect(flagStat.lapsDuration).toBeUndefined();

    const thirdState = {
      lastUpdated: 15000,
      session: {
        flagState: FlagState.GREEN
      }
    };

    session.update(newState, thirdState);
    flagStat = session.flagStats[1];
    expect(flagStat.flag).toEqual(FlagState.YELLOW);
    expect(flagStat.startTime).toEqual(new Date(5000));
    expect(flagStat.endTime).toEqual(new Date(15000));
    expect(flagStat.secondsDuration).toEqual(10);

  });

  it('calculates aggregated flag statistics', () => {
    const session = Session.create({
      flagStats: [
        { flag: FlagState.GREEN, startLap: 0, startTime: 0, endLap: 5, endTime: 5000 },
        { flag: FlagState.YELLOW, startLap: 5, startTime: 5000, endLap: 7, endTime: 8000 },
        { flag: FlagState.GREEN, startLap: 7, startTime: 8000 },
      ]
    });

    const agg = session.aggregateFlagStats;

    expect(agg[FlagState.GREEN].count).toEqual(2);
    expect(agg[FlagState.GREEN].laps).toEqual(5);
    expect(agg[FlagState.YELLOW].time).toEqual(3000);

  });

  it('records the initial flag state', () => {
    const session = Session.create();
    const oldState = {
      lastUpdated: 1000,
      session: {
        flagState: FlagState.GREEN
      }
    };

    const newState = {
      lastUpdated: 1250,
      session: {
        flagState: FlagState.GREEN
      }
    };

    session.update(oldState, newState);

    expect(session.flagStats.length).toEqual(1);
    expect(session.flagStats[0].startTime).toEqual(new Date(1000));

  }

  );

  it('can be reset', () => {
    const session = Session.create({ flagStats: [{ flag: FlagState.RED, startLap: 5, startTime: 5 }] });

    expect(session.flagStats.length).toEqual(1);
    session.reset();
    expect(session.flagStats.length).toEqual(0);
  });
});
