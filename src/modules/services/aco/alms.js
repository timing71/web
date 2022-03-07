import { ACO } from "./service";

export class ALMS extends ACO {
  constructor(...args) {
    super(
      'data.asianlemansseries.com',
      'Asian Le Mans Series',
      ...args
    );
  }
};

ALMS.regex = /live\.asianlemansseries\.com/;
