export class Message {
  constructor(category, message, style, carNum=null, timestamp=null) {
    this.category = category;
    this.message = message;
    this.style = style;
    this.carNum = carNum;
    this.timestamp = timestamp || Date.now();
  }

  toCTDFormat() {
    const val = [this.timestamp, this.category, this.message, this.style];

    if (this.carNum != null) {
      val.push(this.carNum);
    }

    return val;
  }

  static fromCTDFormat(ctd) {
    const m = new Message(ctd[1], ctd[2], ctd[3], ctd[4]);
    m.timestamp = ctd[0];
    return m;
  }
}

const CAR_NUMBER_REGEX = /car #? ?(?<carNum>[0-9]+)/i;

export class RaceControlMessage extends Message {
  constructor(message, timestamp=null) {

    const carNumMatch = message.match(CAR_NUMBER_REGEX);

    super('Race Control', message.toUpperCase(), 'raceControl', carNumMatch?.groups?.carNum, timestamp);
  }
}
