import { Stat } from "./racing";

export class StatExtractor {
  constructor(columnSpec) {
    this._colSpec = columnSpec;
    this._reverseMap = {};
    columnSpec.forEach(
      (stat, idx) => {
        this._reverseMap[stat] = idx;
      }
    );
    this.get = this.get.bind(this);
    this.findCarInList = this.findCarInList.bind(this);
  }

  get(car, stat, defaultValue=null) {
    if (this._reverseMap[stat] !== undefined) {
      return car[this._reverseMap[stat]];
    }
    return defaultValue;
  }

  findCarInList(car, cars=[]) {
    // You'd have hoped that race number would be enough to uniquely
    // identify a car within a session, right? You'd be wrong...
    const wantedNum = this.get(car, Stat.NUM);
    const wantedCar = this.get(car, Stat.CAR);
    const wantedClass = this.get(car, Stat.CLASS);

    if (wantedNum !== undefined) {
      const possibleMatches = cars.filter(
        oldCar => (
          this.get(oldCar, Stat.NUM) === wantedNum &&
          this.get(oldCar, Stat.CAR) === wantedCar &&
          this.get(oldCar, Stat.CLASS) === wantedClass
        )
      );

      if (possibleMatches.length > 1) {
        console.warn(`Found ${possibleMatches.length} possible matches for car ${wantedNum}!`); // eslint-disable-line no-console
      }
      else if (possibleMatches.length === 1) {
        return possibleMatches[0];
      }
    }
  }
}
