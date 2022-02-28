import { v4 as uuid } from 'uuid';

import { connectionService } from "./connectionService";
import { Services } from "./services";

export const serviceCommand = (serviceName, source) => {
  const myUUID = uuid();
  console.log(`Starting service ${serviceName} (${myUUID})`);

  const serviceClass = Services[serviceName];

  if (serviceClass) {
    const serviceDef = {
      source,
      uuid: myUUID
    };
    const service = new serviceClass(console.log, console.log, serviceDef);
    service.start(connectionService);
  }
  else {
    throw new Error(`Unknown timing service: ${serviceName}`);
  }

};
