import { useEffect, useState, useRef } from "react";
import * as Sentry from "@sentry/react";
import { generateMessages } from "@timing71/common/messages";
import { mapServiceProvider } from '@timing71/services';
import deepEqual from "deep-equal";

import { useServiceManifest, useServiceState } from "../../components/ServiceContext";
import { useConnectionService } from "../../ConnectionServiceProvider";

export const processStateUpdate = (oldState, updatedState) => {
  const newState = { ...oldState, ...updatedState };

  const newMessages = generateMessages(newState.manifest, oldState, newState).concat(
    updatedState.extraMessages || [],
  );

  const highlight = [];
  newMessages.forEach(
    nm => {
      if (nm.length >= 5) {
        highlight.push(nm[4]);
      }
    }
  );
  newState.highlight = highlight;

  newState.messages = [
    ...newMessages,
    ...(oldState?.messages || [])
  ].slice(0, 100);

  newState.lastUpdated = Date.now();
  delete newState.extraMessages;

  return newState;
};

// Adds start time and UUID to the manifest, and if a deep equality check fails,
// calls `callback` with the new manifest.
export const processManifestUpdate = (oldManifest, newManifest, startTime, uuid, callback) => {
  const newManifestWithStartTime = {
    ...newManifest,
    startTime: startTime,
    uuid
  };

  if (!deepEqual(newManifestWithStartTime, oldManifest)) {
    callback(newManifestWithStartTime);
  }
};

export const ServiceProvider = ({ onReady, service }) => {
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

        serviceInstance.current = new serviceClass(updateState, updateManifest, service);
        serviceInstance.current.start(cs);
        setHasService(true);
        onReady();
      }
      else if (!serviceClass) {
        setHasService(false);
      }
    },
    [cs, onReady, service, updateManifest, updateState]
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
