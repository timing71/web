import { ACO } from "./service";

export class LeMansCup extends ACO {
  constructor(...args) {
    super(
      'data.lemanscup.com',
      'Le Mans Cup',
      ...args
    );
  }
};

LeMansCup.regex = /live\.lemanscup\.com/;
