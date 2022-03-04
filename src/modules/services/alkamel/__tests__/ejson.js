import { oid } from "../types";

import EJSON from 'ejson';

try {
  EJSON.addType('oid', a => new oid(a));
}
catch {
  console.warn("Error adding oid as EJSON type"); // eslint-disable-line no-console
}

// ddp-client depends on a very old, very broken EJSON parser
// The following test will fail if used with ddp-client's EJSON version:

describe('EJSON parsing of DDP messages', () => {
  it('parses track info correctly', () => {
    const data = "{\"msg\":\"added\",\"collection\":\"track_info\",\"id\":\"6208025123873e03588f6c84\",\"fields\":{\"session\":{\"$type\":\"oid\",\"$value\":\"6202bcc435c83b243087554a\"},\"track\":{\"country\":\"Mexico\",\"length\":2.606,\"name\":\"Mexico\",\"numberOfLoops\":9,\"numberOfTurns\":0,\"sectors\":{\"1\":{\"name\":\"S1\"},\"2\":{\"name\":\"S2\"},\"3\":{\"name\":\"S3\"}},\"shortName\":\"Mexico\"}}}";

    const parsed = EJSON.parse(data);

    expect(parsed.msg).toEqual('added');
    expect(parsed.fields.track.name).toEqual('Mexico');
  });
});
