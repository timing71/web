export class Message {
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
