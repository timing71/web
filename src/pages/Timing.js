import { useCallback, useContext, useEffect, useState } from "react";
import { StackedBarChart } from '@styled-icons/material';


import withGracefulUnmount from "../components/withGracefulUnmount";
import { PluginContext } from "../modules/pluginBridge";
import { TimingScreen } from "../modules/timingScreen";
import { ServiceManifestContext, ServiceStateContext } from "../components/ServiceContext";
import { StateStorer } from "../components/StateStorer";
import { Debouncer } from "../components/Debouncer";
import { StateRetriever } from "../components/StateRetriever";
import { useSetting } from '../modules/settings';
import { Analysis } from "../modules/analysis";
import { LoadingScreen } from "../components/LoadingScreen";
import { ServiceProvider } from "../modules/services";
import { DEFAULT_STATE, processManifestUpdate, processStateUpdate } from "../modules/serviceHost";
import {
  DelayIndicator,
  DelaySetting,
  DownloadReplay,
  Menu,
  MenuBar,
  MenuSeparator,
  Spacer,
  SystemMessage,
  ToggleMenuItem,
  UpdateTime,
  ViewSettings,
  WallClock,
} from "../modules/menu";

const TimingInner = ({ match: { params } }) => {

  // FSR useParams() is now broken here; it uses the params from too high up
  // in the tree so never gets a serviceUUID. Fortunately the match is provided
  // directly to us as a direct descendent of a <Route> (in App.js).
  const { serviceUUID } = params;
  const [service, setService] = useState(null);
  const [state, setState] = useState({ ...DEFAULT_STATE });
  const [initialAnalysisState, setInitialAnalysisState] = useState(null);
  const port = useContext(PluginContext);

  // useEffect(
  //   () => () => {
  //     port.postMessage({
  //       type: 'TERMINATE_SERVICE',
  //       uuid: serviceUUID
  //     });
  //   },
  //   [port, serviceUUID]
  // );

  useEffect(
    () => {

      port.send({
        type: 'FETCH_SERVICE',
        uuid: serviceUUID
      }).then(
        msg => {
          setService(msg.service);
          setState(msg.state);
          setInitialAnalysisState(msg.analysis.state);
        }
      );

    },
    [port, serviceUUID]
  );

  const updateState = useCallback(
    (updatedState) => {
      setState(
        oldState => processStateUpdate(oldState, updatedState)
      );
    },
    []
  );

  const updateManifest = useCallback(
    (newManifest) => processManifestUpdate(
      state.manifest,
      newManifest,
      service.startTime,
      serviceUUID,
      (m) => updateState({ manifest: m })
    ),
    [service?.startTime, serviceUUID, state.manifest, updateState]
  );

  const [ delay ] = useSetting('delay');

  const [serviceProviderReady, setSPReady] = useState(false);

  const setReady = useCallback(
    () => setSPReady(true),
    []
  );

  const openAnalysis = useCallback(
    () => {
      port.send({ type: 'SHOW_T71_PAGE', page: `analysis/${serviceUUID}` });
    },
    [port, serviceUUID]
  );

  if (service && state && initialAnalysisState) {

    return (
      <ServiceManifestContext.Provider value={{ manifest: state.manifest, updateManifest }}>
        <ServiceStateContext.Provider value={{ state, updateState }}>
          <ServiceProvider
            onReady={setReady}
            service={service}
          />
          {
            serviceProviderReady && (
              <Debouncer>
                <Analysis
                  analysisState={initialAnalysisState}
                  live
                  serviceUUID={serviceUUID}
                />
                <StateStorer serviceUUID={serviceUUID} />
                <StateRetriever
                  delay={delay * 1000}
                  serviceUUID={serviceUUID}
                >
                  <TimingScreen>
                    <MenuBar>
                      <WallClock />
                      <UpdateTime />
                      <Spacer />
                      <SystemMessage />
                      <DelayIndicator />
                      <Menu>
                        <DelaySetting />
                        <MenuSeparator />
                        <ToggleMenuItem onClick={openAnalysis}>
                          <span>
                            <StackedBarChart size={24} />
                          </span>
                          <label>Launch analysis</label>
                        </ToggleMenuItem>
                        <MenuSeparator />
                        <ViewSettings />
                        <MenuSeparator />
                        <DownloadReplay />
                      </Menu>
                    </MenuBar>
                  </TimingScreen>
                </StateRetriever>
              </Debouncer>
            )
          }
        </ServiceStateContext.Provider>
      </ServiceManifestContext.Provider>
    );
  }

  return (
    <LoadingScreen message='Loading timing data...' />
  );
};

export const Timing = withGracefulUnmount(TimingInner);
