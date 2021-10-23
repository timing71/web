import { FlagState, Stat } from './racing';
import { StatExtractor } from './statExtractor';

class Message {
  constructor(category, message, style, carNum=null) {
    this.category = category;
    this.message = message;
    this.style = style;
    this.carNum = carNum;
    this.timestamp = Date.now();
  }

  toCTDFormat() {
    const val = [this.timestamp, this.category, this.message, this.style];

    if (this.carNum) {
      val.push(this.carNum);
    }

    return val;
  }
}

const perCar = (generator) => (manifest, oldState, newState) => {

  const messages = [];

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
          const possibleMessage = generator(se, possibleMatches[0], newCar);
          if (possibleMessage) {
            messages.push(possibleMessage);
          }
        }
      }
    );
  }

  return messages;

};


const FlagMessage = (manifest, oldState, newState) => {

  const newFlag = newState.session?.flagState;

  if (oldState.session?.flagState && oldState.session.flagState !== newFlag) {
    switch(newFlag) {
      case FlagState.GREEN:
        return new Message('Track', 'Green flag - track clear', 'green');
      case FlagState.SC:
        return new Message('Track', 'Safety car deployed', 'yellow');
      case FlagState.VSC:
        return new Message('Track', 'Virtual safety car deployed', 'yellow');
      case FlagState.YELLOW:
        return new Message('Track', 'Yellow flags shown', 'yellow');
      case FlagState.FCY:
        return new Message('Track', 'Full course yellow', 'yellow');
      case FlagState.CAUTION:
        return new Message('Track', 'Full course caution', 'yellow');
      case FlagState.RED:
        return new Message('Track', 'Red flag', 'red');
      case FlagState.CHEQUERED:
        return new Message("Track", "Chequered flag", "track");
      case FlagState.CODE_60:
        return new Message("Track", "Code 60", "code60");
      case FlagState.WHITE:
        return new Message("Track", "White flag - final lap", "white");
      default:
    }
  }
};

const PitMessage = perCar(
  (se, oldCar, newCar) => {
    const oldState = se.get(oldCar, Stat.STATE);
    const newState = se.get(newCar, Stat.STATE);
    const carNum = se.get(newCar, Stat.NUM);

    if (oldState !== newState && !!carNum && oldState !== 'N/S') {

      const driver = se.get(newCar, Stat.DRIVER);
      const clazz = se.get(newCar, Stat.CLASS, 'Pits');

      const driverText = driver ? ` (${driver})` : '';

      if ((oldState !== 'RUN' && newState === 'OUT') || (oldState === 'PIT' && newState === 'RUN')) {
        return new Message(clazz, `#${carNum}${driverText} has left the pits`, 'out', carNum);
      }
      else if (newState === 'PIT') {
        return new Message(clazz, `#${carNum}${driverText} has entered the pits`, 'pit', carNum);
      }
    }
  }
);

const DriverChangeMessage = perCar(
  (se, oldCar, newCar) => {
    const oldDriver = se.get(oldCar, Stat.DRIVER);
    const newDriver = se.get(newCar, Stat.DRIVER);
    const carNum = se.get(newCar, Stat.NUM);
    const clazz = se.get(newCar, Stat.CLASS, 'Pits');

    if (!!carNum && oldDriver !== newDriver) {
      let message = '';
      if (!oldDriver) {
        message = `#${carNum} Driver change (to ${newDriver})`;
      }
      else if (!newDriver) {
        message = `#${carNum} Driver change (${oldDriver} to nobody)`;
      }
      else {
        message = `#${carNum} Driver change (${oldDriver} to ${newDriver})`;
      }

      return new Message(
        clazz,
        message,
        null,
        carNum
      );
    }
  }
);

const MESSAGE_GENERATORS = [
  FlagMessage,
  PitMessage,
  DriverChangeMessage
];

export const generateMessages = (manifest, oldState, newState) => {
  return MESSAGE_GENERATORS.flatMap(
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
};
