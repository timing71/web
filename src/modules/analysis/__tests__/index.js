import { createAnalyser } from "..";

import LM24 from './2021_lm24.json';

describe('Analyser', () => {
  it('can be constructed with an undefined initial state', () => {
    const a = createAnalyser();

    expect(a.cars.count).toEqual(0);
    expect(a.session).toBeDefined();
    expect(a.version).toEqual(2);
  });

  it('can be constructed using a v1 analysis state file', () => {
    const a = createAnalyser(LM24);

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
  });
});
