import { connectionService } from "./connectionService";
import { Services } from "./services";

export const serviceCommand = (serviceName) => {
  console.log('Starting service...', serviceName);

  const serviceClass = Services[serviceName];

  if (serviceClass) {
    const service = new serviceClass(console.log, console.log);
    service.start(connectionService);
  }
  else {
    throw new Error(`Unknown timing service: ${serviceName}`);
  }

};
