import { FlagState } from "../../../racing";
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

    session.update(oldState, newState);

    expect(session.flagStats.length).toEqual(1);
    let flagStat = session.flagStats[0];
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
    flagStat = session.flagStats[0];
    expect(flagStat.flag).toEqual(FlagState.YELLOW);
    expect(flagStat.startTime).toEqual(new Date(5000));
    expect(flagStat.endTime).toEqual(new Date(15000));
    expect(flagStat.secondsDuration).toEqual(10);

  });

  it('can be reset', () => {
    const session = Session.create({ flagStats: [{ flag: FlagState.RED, startLap: 5, startTime: 5 }] });

    expect(session.flagStats.length).toEqual(1);
    session.reset();
    expect(session.flagStats.length).toEqual(0);
  });
});
