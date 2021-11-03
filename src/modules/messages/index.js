import { Stat } from '../../racing';
import { StatExtractor } from '../../statExtractor';

import { DriverChangeMessage } from './DriverChangeMessage';
import { FastLapMessage } from './FastLapMessage';
import { FlagMessage } from './FlagMessage';
import { PitMessage } from './PitMessage';


const GLOBAL_GENERATORS = [
  FlagMessage
];

const PER_CAR_GENERATORS = [
  FastLapMessage,
  PitMessage,
  DriverChangeMessage
];

export const generateMessages = (manifest, oldState, newState) => {
  const globalMessages = GLOBAL_GENERATORS.flatMap(
    mg => {
      const maybeMessages = mg(manifest, oldState, newState);
      if (Array.isArray(maybeMessages)) {
        return maybeMessages.map(m => m.toCTDFormat());
      }
      else if (maybeMessages?.toCTDFormat) {
        return [maybeMessages.toCTDFormat()];
      }
      return [];
    }
  );

  const perCarMessages = [];

  if (manifest.columnSpec?.includes(Stat.NUM)) {
    const se = new StatExtractor(manifest.columnSpec);
    (newState.cars || []).forEach(
      newCar => {
        // You'd have hoped that race number would be enough to uniquely
        // identify a car within a session, right? You'd be wrong...
        const wantedNum = se.get(newCar, Stat.NUM);
        const wantedCar = se.get(newCar, Stat.CAR);
        const wantedClass = se.get(newCar, Stat.CLASS);

        const possibleMatches = (oldState.cars || []).filter(
          oldCar => (
            se.get(oldCar, Stat.NUM) === wantedNum &&
            se.get(oldCar, Stat.CAR) === wantedCar &&
            se.get(oldCar, Stat.CLASS) === wantedClass
          )
        );

        if (possibleMatches.length > 1) {
          console.warn(`Found ${possibleMatches.length} possible matches for car ${wantedNum}!`); // eslint-disable-line no-console
        }
        else if (possibleMatches.length === 1) {
          PER_CAR_GENERATORS.forEach(
            generator => {
              const possibleMessage = generator(se, possibleMatches[0], newCar);
              if (possibleMessage) {
                perCarMessages.push(possibleMessage.toCTDFormat());
              }
            }
          );
        }
      }
    );
  }

  return globalMessages.concat(perCarMessages);
};
