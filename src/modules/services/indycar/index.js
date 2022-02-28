import { HTTPPollingService } from "../service";
import { getManifest, translate } from "./translate";

const DATA_URL = 'https://indycarsso.blob.core.windows.net/racecontrol/timingscoring.json';
const POLL_RATE = 10000;

export class IndyCar extends HTTPPollingService {

  constructor(onStateChange, onManifestChange, service) {
    super(
      DATA_URL,
      POLL_RATE,
      onStateChange,
      onManifestChange,
      service
    );
  }

  async handleResponse(response) {
    const data = response.replace(/^jsonCallback\(/, '').replace(/\);\r\n$/, '');
    const jsonData = JSON.parse(data);

    this.onManifestChange(getManifest(jsonData));
    this.onStateChange(translate(jsonData));
  }
}

IndyCar.regex = /racecontrol\.indycar\.com/;
