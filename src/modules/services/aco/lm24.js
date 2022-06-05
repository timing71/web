import { ACO } from "./service";

export class LM24 extends ACO {
  constructor(...args) {
    super(
      'data.24h-lemans.com',
      'Le Mans 24 Hours',
      ...args
    );
  }
};

LM24.regex = /live\.24h-lemans\.com/;
