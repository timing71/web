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
