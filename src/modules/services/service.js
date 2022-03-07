export class Service {
  constructor(onStateChange, onManifestChange, service) {
    this.onManifestChange = onManifestChange;
    this.onStateChange = onStateChange;
    this.service = service;
  }
}

export class HTTPPollingService extends Service {
  constructor(url, pollInterval, onStateChange, onManifestChange, service) {
    super(onStateChange, onManifestChange, service);
    this.url = url;
    this.pollInterval = pollInterval;
    this.start = this.start.bind(this);
    this.handleResponse = this.handleResponse.bind(this);
    this._fetch = this._fetch.bind(this);

    this._timeout = null;
  }

  start(connectionService) {
    this.connectionService = connectionService;
    this._fetch();
  }

  stop() {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
  }

  async _fetch() {
    const myUrl = (typeof(this.url) === 'function') ? this.url() : this.url;
    const response = await this.connectionService.fetch(myUrl);
    this.handleResponse(response);
    this._timeout = setTimeout(
      this._fetch,
      this.pollInterval
    );
  }

  async handleResponse(response) {
    // Should be implemented by subclasses
  }
}
