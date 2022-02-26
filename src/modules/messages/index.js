import { Stat } from '../../racing';
import { StatExtractor } from '../../statExtractor';

import { DriverChangeMessage } from './DriverChangeMessage';
import { FastLapMessage } from './FastLapMessage';
import { FlagMessage } from './FlagMessage';
import { PitMessage } from './PitMessage';
import { StopResumeMessage } from './StopResumeMessage';

export { Message } from './Message';


const GLOBAL_GENERATORS = [
  FlagMessage
];

const PER_CAR_GENERATORS = [  // Order can be significant (e.g. driver change before pit out!)
  FastLapMessage,
  PitMessage,
  DriverChangeMessage,
  StopResumeMessage
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

  if (manifest.colSpec?.find(s => s[0] === Stat.NUM[0])) { // Can't use includes() any more FSR...
    const se = new StatExtractor(manifest.colSpec);
    (newState.cars || []).forEach(
      newCar => {
        const oldCar = se.findCarInList(newCar, oldState.cars);
        if (oldCar) {
          PER_CAR_GENERATORS.forEach(
            generator => {
              const possibleMessage = generator(se, oldCar, newCar);
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
