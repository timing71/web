import { HTTPPollingService } from "../service";
import { Debouncer } from "./debounce";
import { getManifest, translate } from "./translate";

const DATA_URL = 'https://indycarsso.blob.core.windows.net/racecontrol/timingscoring.json';
const POLL_RATE = 10000;

const cacheBustedURL = () => `${DATA_URL}?_=${Date.now()}`;

export class IndyCar extends HTTPPollingService {

  constructor(onStateChange, onManifestChange, service) {
    super(
      cacheBustedURL,
      POLL_RATE,
      onStateChange,
      onManifestChange,
      service
    );

    this._debouncer = new Debouncer();
  }

  async handleResponse(response) {
    const data = response.replace(/^jsonCallback\(/, '').replace(/\);\r\n$/, '');
    const jsonData = JSON.parse(data);

    this.onManifestChange(getManifest(jsonData));
    this.onStateChange(translate(jsonData, this._debouncer));
  }
}

IndyCar.regex = /racecontrol\.indycar\.com/;
