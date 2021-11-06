const REF_URL = "https://storage.googleapis.com/ecm-prod/assets/live";

export class ReferenceData {
  constructor(host, fetchFunc) {
    this.host = host;
    this.fetchFunc = fetchFunc;
    this.load = this.load.bind(this);

    this.data = {};
  }

  async load() {
    const url = `https://${this.host}/en/live`;
    const webPage = await this.fetchFunc(url);
    const raceID = webPage.match(/.*data-race="([0-9]+)"/);
    if (raceID) {
      const refData = await this.fetchFunc(`${REF_URL}/${raceID[1]}.json`);
      this.data = JSON.parse(refData);
    }
    else {
      // try again in 30 seconds
      setTimeout(
        this.load,
        30000
      );
    }
  }
}
