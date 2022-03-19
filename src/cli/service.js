import { v4 as uuid } from 'uuid';
import { DEFAULT_STATE, processManifestUpdate, processStateUpdate } from '../modules/serviceHost';

import { connectionService } from "./connectionService";
import { Recorder } from './record';
import { Services } from "./services";

export const serviceCommand = (serviceName, source, options) => {
  const myUUID = uuid();
  console.log(`Starting service ${serviceName} (${myUUID})`);

  let recorder = options.record ? new Recorder(myUUID) : null;

  const serviceClass = Services[serviceName];

  if (serviceClass) {
    const serviceDef = {
      startTime: Date.now(),
      source,
      uuid: myUUID
    };

    let state = { ...DEFAULT_STATE };

    const onStateChange = (newState) => {
      state = processStateUpdate(state, newState);

      if (recorder) {
        recorder.addFrame(state);
      }
      else {
        console.log(state);
      }
    };

    const onManifestChange = (newManifest) => {
      processManifestUpdate(
        state.manifest,
        newManifest,
        serviceDef.startTime,
        serviceDef.uuid,
        (m) => {
          onStateChange({ manifest: m });
          recorder && recorder.writeManifest(m);
        }
      );
    };

    const service = new serviceClass(onStateChange, onManifestChange, serviceDef);
    service.start(connectionService);
  }
  else {
    throw new Error(`Unknown timing service: ${serviceName}`);
  }

};
