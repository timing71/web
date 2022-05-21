import { HTTPPollingService } from "../service";
import { getManifest, getState } from "./translate";

const BASE_URL = 'https://wseries.com/static/timings/api/';
const POLL_RATE = 5000;

export class WSeries extends HTTPPollingService {

  constructor(onStateChange, onManifestChange, service) {

    const queryString = service.source.slice(service.source.indexOf('?'));
    const params = new URLSearchParams(queryString);

    const dataURL = `${BASE_URL}?date=${params.get('date')}&session=${params.get('session')}`;

    super(
      dataURL,
      POLL_RATE,
      onStateChange,
      onManifestChange,
      service
    );


    this.onManifestChange(
      getManifest(params.get('race'), params.get('session'))
    );
  }

  async handleResponse(response) {

    try {
      const data = JSON.parse(response);
      this.onStateChange(getState(data));
    }
    catch {
      // Nope
    }

  }
}

WSeries.regex = /wseries.com\/static\/timings\/.date=.+&session=[a-zA-Z]+&race=.+/;
