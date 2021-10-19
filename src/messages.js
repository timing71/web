import { FlagState } from './racing';

class Message {
  constructor(category, message, style) {
    this.category = category;
    this.message = message;
    this.style = style;
    this.timestamp = Date.now();
  }

  toCTDFormat() {
    return [this.timestamp, this.category, this.message, this.style];
  }
}


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

const MESSAGE_GENERATORS = [
  FlagMessage
];

export const generateMessages = (manifest, oldState, newState) => {
  return MESSAGE_GENERATORS.map(
    mg => mg(manifest, oldState, newState)
  ).filter(a => !!a).map(m => m.toCTDFormat());
};
