import { ALMS, ELMS, LeMansCup, WEC } from "./aco";
import { AlKamel } from "./alkamel";
import { IndyCar } from "./indycar";
import { Nascar } from "./nascar";
import { TimeService } from "./timeservice";

export const SERVICE_PROVIDERS = [
  AlKamel,
  ALMS,
  ELMS,
  IndyCar,
  LeMansCup,
  Nascar,
  TimeService,
  WEC
];

export const mapServiceProvider = (source) => {

  for (var i=0; i < SERVICE_PROVIDERS.length; i++) {
    if (source.search(SERVICE_PROVIDERS[i].regex) >= 0) {
      return SERVICE_PROVIDERS[i];
    }
  }
};
