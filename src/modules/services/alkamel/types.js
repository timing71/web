import EJSON from "ejson";

export class oid {
  constructor(value) {
    this.value = value;
  }
  toJSONValue() {
    return this.value;
  }
  typeName() {
    return 'oid';
  }
}

try {
  EJSON.addType('oid', a => new oid(a));
}
catch {
  // when hot reloading, EJSON will already have this type
}
