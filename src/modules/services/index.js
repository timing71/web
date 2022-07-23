import { useEffect, useState, useRef } from "react";
import * as Sentry from "@sentry/react";

import { useServiceManifest, useServiceState } from "../../components/ServiceContext";
import { useConnectionService } from "../../ConnectionServiceProvider";

import { ALMS, ELMS, LeMansCup, WEC } from "./aco";
import { AlKamel } from "./alkamel";
import { Cronococa } from './cronococa';
import { F2, F3 } from "./feederSeries";
import { IndyCar } from "./indycar";
import { LM24 } from "./aco/lm24";
import { Nascar } from "./nascar";
import { Natsoft } from "./natsoft/service";
import { SoftPauer } from "./softpauer";
import { SwissTiming } from "./swissTiming";
import { TimeService } from "./timeservice";
import { TSL } from "./tsl";
import { WSeries } from "./wseries";

export const SERVICE_PROVIDERS = [
  AlKamel,
  ALMS,
  Cronococa,
  ELMS,
  F2,
  F3,
  IndyCar,
  LeMansCup,
  LM24,
  Nascar,
  Natsoft,
  SoftPauer,
  SwissTiming,
  TimeService,
  TSL,
  WEC,
  WSeries
];

export const mapServiceProvider = (source) => {
  if (source.slice(0, 4) === 't71 ') {
    const providerClass = source.slice(4, source.indexOf(':'));
    for (let i = 0; i < SERVICE_PROVIDERS.length; i++) {
      if (SERVICE_PROVIDERS[i].name === providerClass) {
        return SERVICE_PROVIDERS[i];
      }
    }
  }

  for (let i = 0; i < SERVICE_PROVIDERS.length; i++) {
    if (source.search(SERVICE_PROVIDERS[i].regex) >= 0) {
      return SERVICE_PROVIDERS[i];
    }
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
