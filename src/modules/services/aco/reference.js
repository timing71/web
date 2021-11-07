const REF_URL = "https://storage.googleapis.com/ecm-prod/assets/live";

export class ReferenceData {
  constructor(host, fetchFunc) {
    this.host = host;
    this.fetchFunc = fetchFunc;
    this.load = this.load.bind(this);

    this.data = {};
  }

  load() {
    return new Promise(
      (resolve, reject) => {
        const url = `https://${this.host}/en/live`;
        this.fetchFunc(url).then(
          webPage => {
            const raceID = webPage.match(/.*data-race="([0-9]+)"/);
            if (raceID) {
              this.fetchFunc(`${REF_URL}/${raceID[1]}.json`).then(
                refData => {
                  this.data = JSON.parse(refData);
                  resolve(this.data);
                }
              ).catch(reject);
            }
            else {
              reject();
            }
          }
        ).catch(reject);
      }
    );
  }
}
