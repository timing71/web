import { Events, mapServiceProvider } from '@timing71/common';
import { useEffect, useState, useRef } from "react";
import * as Sentry from "@sentry/react";

import { useServiceManifest, useServiceState } from "../../components/ServiceContext";
import { useConnectionService } from "../../ConnectionServiceProvider";

export const ServiceProvider = ({ initialState, onSessionChange, onReady, service }) => {
  const cs = useConnectionService();

  const { updateManifest } = useServiceManifest();
  const { updateState } = useServiceState();

  const [hasService, setHasService] = useState(false);

  const serviceInstance = useRef();

  useEffect(
    () => {
      const serviceClass = mapServiceProvider(service.source);
      if (serviceClass && !serviceInstance.current) {

        Sentry.setTags({
          serviceClass: serviceClass.name,
          source: service.source
        });

        serviceInstance.current = new serviceClass(service, initialState);

        serviceInstance.current.on(Events.STATE_CHANGE, updateState);
        serviceInstance.current.on(Events.MANIFEST_CHANGE, updateManifest);
        serviceInstance.current.on(Events.SESSION_CHANGE, onSessionChange);

        serviceInstance.current.start(cs);
        setHasService(true);
        onReady();
      }
      else if (!serviceClass) {
        setHasService(false);
      }
    },
    [cs, initialState, onSessionChange, onReady, service, updateManifest, updateState]
  );

  useEffect(
    () => () => {
      serviceInstance.current?.stop();
    },
    []
  );

  if (!hasService) {
    return (
      <p>No service provider found for <cite>{service.source}</cite>!</p>
    );
  }

  return null;
};
