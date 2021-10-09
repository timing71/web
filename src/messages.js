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

  if (oldState.session?.flagState !== newFlag) {
    switch(newFlag) {
      case 'GREEN':
        return new Message('Track', 'Green flag - track clear', 'green');
      case 'RED':
        return new Message('Track', 'Red flag', 'red');
      case 'CHEQUERED':
        return new Message("Track", "Chequered flag", "track");
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
