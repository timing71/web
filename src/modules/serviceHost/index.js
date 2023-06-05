import { Events, Severity, mapServiceProvider } from '@timing71/common';
import { useEffect, useState, useRef } from "react";
import * as Sentry from "@sentry/react";

import { useServiceManifest, useServiceState } from "../../components/ServiceContext";
import { useConnectionService } from "../../ConnectionServiceProvider";
import { useSystemMessagesContext } from '../systemMessages';

export const ServiceProvider = ({ initialState, onReady, onSessionChange, service }) => {
  const cs = useConnectionService();

  const { updateManifest } = useServiceManifest();
  const { updateState } = useServiceState();
  const { addMessage, removeMessage } = useSystemMessagesContext();

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
        serviceInstance.current.on(
          Events.SYSTEM_MESSAGE,
          (msg) => {
            logSystemMessageToConsole(msg);

            if (addMessage) {
              addMessage(msg);
            }
          }
        );
        serviceInstance.current.on(
          Events.RETRACT_SYSTEM_MESSAGE,
          ({ uuid }) => removeMessage(uuid)
        );

        serviceInstance.current.start(cs);
        setHasService(true);
        onReady();
      }
      else if (!serviceClass) {
        setHasService(false);
      }
    },
    [addMessage, cs, initialState, onSessionChange, onReady, removeMessage, service, updateManifest, updateState]
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

function logSystemMessageToConsole(msg) {
  let consoleMethod = 'log';
  switch (msg.severity) {
    case Severity.DEBUG:
      consoleMethod = 'debug';
      break;
    case Severity.INFO:
      consoleMethod = 'info';
      break;
    case Severity.WARNING:
      consoleMethod = 'warn';
      break;
    case Severity.ERROR:
      consoleMethod = 'error';
      break;
    default:
      consoleMethod = 'log';
  }
  console[consoleMethod](msg.message); // eslint-disable-line no-console
}
