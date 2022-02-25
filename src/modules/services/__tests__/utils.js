import { parseTime } from "../utils";

describe('parseTime', () => {

  it('parses secs', () => {
    expect(parseTime('12')).toEqual(12);
  });

  it('parses mins:secs', () => {
    expect(parseTime('3:14')).toEqual(194);
    expect(parseTime('03:14')).toEqual(194);
    expect(parseTime('63:14')).toEqual(3794);
  });

  it('parses hours:mins:secs', () => {
    expect(parseTime('2:13:21')).toEqual(21 + (60 * 13) + (3600 * 2));
    expect(parseTime('24:00:00')).toEqual(24 * 3600);
    expect(parseTime('00:00:00')).toEqual(0);
  });

  it('parses mins:secs.msecs', () => {
    expect(parseTime('3:14.123')).toEqual(194.123);
  });

  it('parses hours:mins:secs.msecs', () => {
    expect(parseTime('5:03:14.123')).toEqual(14.123 + (60 * 3) + (3600 * 5));
    expect(parseTime('5:3:14.123')).toEqual(14.123 + (60 * 3) + (3600 * 5));
  });
});
