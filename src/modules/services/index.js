import { IndyCar } from "./indycar";
import { ELMS, LeMansCup, WEC } from "./aco";
import { AlKamel } from "./alkamel";
import { TimeService } from "./timeservice";

export const SERVICE_PROVIDERS = [
  AlKamel,
  ELMS,
  IndyCar,
  LeMansCup,
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
