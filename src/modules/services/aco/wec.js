import { ACO } from "./service";

export class WEC extends ACO {
  constructor(...args) {
    super(
      'data.fiawec.com',
      'FIA WEC',
      ...args
    );
  }
};

WEC.regex = /live\.fiawec\.com/;
