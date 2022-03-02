import { HTTPPollingService } from '../service';

import { getManifest, translate } from "./translate";

const DATA_URL = 'https://cf.nascar.com/live/feeds/live-feed.json';

export class Nascar extends HTTPPollingService {
  constructor(...args) {
    super(
      DATA_URL,
      5000,
      ...args
    );
  }

  handleResponse(message) {
    const jsonData = JSON.parse(message);
    this.onManifestChange(getManifest(jsonData));
    this.onStateChange(translate(jsonData));

  }

}

Nascar.regex = /.*\.nascar\.com/;
