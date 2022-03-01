import { ACO } from "./service";

export class ELMS extends ACO {
  constructor(...args) {
    super(
      'data.europeanlemansseries.com',
      'European Le Mans Series',
      ...args
    );
  }
};

ELMS.regex = /live\.europeanlemansseries\.com/;
