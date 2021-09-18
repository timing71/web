import { IndyCar } from "./indycar";
import { LeMansCup } from "./lemanscup";

const SERVICE_PROVIDERS = [
  IndyCar,
  LeMansCup
];

export const mapServiceProvider = (source) => {

  for (var i=0; i < SERVICE_PROVIDERS.length; i++) {
    if (source.search(SERVICE_PROVIDERS[i].regex) >= 0) {
      return SERVICE_PROVIDERS[i];
    }
  }
};
