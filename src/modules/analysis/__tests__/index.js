import { createAnalyser } from "..";
import { CURRENT_VERSION } from "../migrate";

import LM24 from './2021_lm24.json';

describe('Analyser', () => {
  it('can be constructed with an undefined initial state', () => {
    const a = createAnalyser();

    expect(a.cars.count).toEqual(0);
    expect(a.session).toBeDefined();
    expect(a.version).toEqual(CURRENT_VERSION);
  });

  it('can be constructed using a v1 analysis state file', () => {
    const a = createAnalyser(LM24);

    expect(a.latestTimestamp).toEqual(new Date('2021-08-22T14:01:18.128Z'));
    expect(a.manifest.name).toEqual('Le Mans 24 Hours');
    expect(a.manifest.colSpec.length).toEqual(20);

    expect(a.cars.count).toEqual(61);

    const car = a.cars.get('1');
    expect(car.teamName).toEqual('Richard Mille Racing Team');
    expect(car.raceClass).toEqual('LMP2');
    expect(car.make).toEqual('Oreca 07 - Gibson');

    expect(car.drivers.length).toEqual(3);
    expect(car.drivers[2].name).toEqual('FLOERSCH, Sophia');

    expect(car.stints.length).toEqual(7);

    const stint = car.stints[1];
    expect(stint.startLap).toEqual(11);
    expect(stint.endLap).toEqual(21);
    expect(stint.startTime).toEqual(new Date('2021-08-21T14:49:34.141Z'));
    expect(stint.isInProgress).toBeFalsy();
    expect(stint.driver.name).toEqual('CALDERON, Tatiana');

    expect(stint.laps.length).toEqual(11);
    expect(stint.laps[3].flag).toEqual('slow_zone');
    expect(stint.laps[10].lapNumber).toEqual(21);

    expect(car.stints[0].laps[0].lapNumber).toEqual(1);

    expect(a.session.leaderLap).toEqual(371);

    const flagStats = a.session.flagStats;
    expect(flagStats.length).toEqual(188);
    expect(flagStats[101].flag).toEqual('yellow');
    expect(flagStats[101].secondsDuration).toEqual(198);

    const messages = a.messages.messages;
    expect(messages.length).toEqual(2235);
    expect(messages[1234].timestamp).toEqual(new Date('2021-08-21T17:37:48.000Z'));

    const state = a.state;
    expect(state.session.flagState).toEqual('chequered');
    expect(state.session.timeRemain).toEqual(-0.273416);
  });
});
