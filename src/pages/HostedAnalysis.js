import { createAnalyser, migrateAnalysisState } from "@timing71/common/analysis";
import LZString from "lz-string";
import { applySnapshot } from "mobx-state-tree";
import { useEffect, useRef, useState } from "react";
import { useRouteMatch } from "react-router-dom";

import { LoadingScreen } from "../components/LoadingScreen";
import { AnalysisScreen } from "../modules/analysis";
import { useSession, useSubscription } from "../modules/autobahn";

export const HostedAnalysis = () => {

  const analyser = useRef(createAnalyser(undefined, true));
  const initialised = useRef(false);
  const startTime = useRef(undefined);
  const { params: { uuid } } = useRouteMatch();
  const services = useSubscription('livetiming.directory', { get_retained: true });
  const manifest = services?.find(s => s.uuid === uuid);

  const compressedServiceState = useSubscription(`livetiming.service.${uuid}`, { get_retained: true });
  const [lastUpdated, setLastUpdated] = useState();

  useEffect(
    // Legacy state doesn't include a lastUpdated timestamp
    // We splat serviceState after we include it so that we don't squash any
    // timestamp if it does appear in the upstream state.
    () => {
      setLastUpdated(Date.now());
    },
    [compressedServiceState]
  );

  const serviceState = compressedServiceState && JSON.parse(LZString.decompressFromUTF16(compressedServiceState));
  if (serviceState) {
    serviceState.lastUpdated = lastUpdated;
    serviceState.manifest = manifest;
    serviceState.manifest.startTime = startTime.current;
  }

  const session = useSession();

  const prevState = useRef(serviceState);

  useEffect(
    () => {
      if (session && manifest && serviceState && !initialised.current) {
        // Get current (legacy) analysis state from the service...
        session.call(`livetiming.service.requestAnalysisData.${uuid}`).then(
          d => {
            const analysisState = migrateAnalysisState({
              ...d,
              service: manifest,
              state: serviceState
            });
            applySnapshot(analyser.current, analysisState);
            startTime.current = analysisState.manifest.startTime;
          }
        );
        initialised.current = true;
      }
    },
    [manifest, serviceState, session, uuid]
  );

  useEffect(
    () => {
      // ...but rely on our own incremental state updates to keep analysis
      // up to date.
      analyser.current.updateState(
        prevState.current,
        serviceState
      );
      prevState.current = serviceState;
    },
    [serviceState]
  );

  if (analyser.current && manifest) {
    return (
      <AnalysisScreen
        analyser={analyser.current}
        manifest={manifest}
      >
        {/* <AnalysisButton
          label='Download analysis'
          uuid={uuid}
        /> */}
      </AnalysisScreen>
    );
  }
  else {
    return (
      <LoadingScreen message='Loading data...' />
    );
  }
};

export default HostedAnalysis;
