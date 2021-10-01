export class StatExtractor {
  constructor(columnSpec) {
    this._colSpec = columnSpec;
    this._reverseMap = {};
    columnSpec.forEach(
      (stat, idx) => {
        this._reverseMap[stat] = idx;
      }
    );
  }

  get(car, stat, defaultValue=null) {
    if (this._reverseMap[stat] !== undefined) {
      return car[this._reverseMap[stat]];
    }
    return defaultValue;
  }
}
