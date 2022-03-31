import { useContext, useEffect, useState, useRef } from "react";
import * as Sentry from "@sentry/react";

import { useServiceManifest, useServiceState } from "../../components/ServiceContext";
import { PluginContext } from "../pluginBridge";

import { ALMS, ELMS, LeMansCup, WEC } from "./aco";
import { AlKamel } from "./alkamel";
import { F2, F3 } from "./feederSeries";
import { IndyCar } from "./indycar";
import { Nascar } from "./nascar";
import { SoftPauer } from "./softpauer";
import { TimeService } from "./timeservice";

export const SERVICE_PROVIDERS = [
  AlKamel,
  ALMS,
  ELMS,
  F2,
  F3,
  IndyCar,
  LeMansCup,
  Nascar,
  SoftPauer,
  TimeService,
  WEC
];

export const mapServiceProvider = (source) => {

  for (var i=0; i < SERVICE_PROVIDERS.length; i++) {
    if (source.search(SERVICE_PROVIDERS[i].regex) >= 0) {
      return SERVICE_PROVIDERS[i];
    }
  }
};


export const ServiceProvider = ({ onReady, service }) => {
  const port = useContext(PluginContext);

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
        serviceInstance.current.start(port);
        setHasService(true);
        onReady();
      }
      else if (!serviceClass) {
        setHasService(false);
      }
    },
    [onReady, port, service, updateManifest, updateState]
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
