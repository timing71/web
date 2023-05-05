import { useCallback, useEffect, useState } from "react";
import { StackedBarChart } from '@styled-icons/material';

import withGracefulUnmount from "../components/withGracefulUnmount";
import { useConnectionService } from "../ConnectionServiceProvider";
import { TimingScreen } from "../modules/timingScreen";
import { ServiceManifestContext, ServiceStateContext } from "../components/ServiceContext";
import { StateStorer } from "../components/StateStorer";
import { Debouncer } from "../components/Debouncer";
import { StateRetriever } from "../components/StateRetriever";
import { useSetting } from '../modules/settings';
import { Analysis } from "../modules/analysis/components";
import { LoadingScreen } from "../components/LoadingScreen";
import { ServiceProvider } from "../modules/serviceHost";
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

const doNothing = () => {};

const TimingInner = ({ match: { params } }) => {

  // FSR useParams() is now broken here; it uses the params from too high up
  // in the tree so never gets a serviceUUID. Fortunately the match is provided
  // directly to us as a direct descendent of a <Route> (in App.js).
  const { serviceUUID } = params;
  const [service, setService] = useState(null);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [state, setState] = useState(null);
  const [initialAnalysisState, setInitialAnalysisState] = useState(null);
  const cs = useConnectionService();

  useEffect(
    () => {

      cs.send({
        type: 'FETCH_SERVICE',
        uuid: serviceUUID
      }).then(
        msg => {
          setState(msg.state);
          setService(msg.service);
          if (!!msg.analysis) {
            setInitialAnalysisState(msg.analysis.state);
          }
        }
      );

    },
    [cs, serviceUUID]
  );

  const updateState = useCallback(
    (updatedState) => {
      setState(
        oldState => ({ ...oldState, ...updatedState })
      );
    },
    []
  );

  const onSessionChange = useCallback(
    (newIndex) => {
      setSessionIndex(newIndex || 0);
    },
    []
  );

  const [ delay ] = useSetting('delay');

  const [serviceProviderReady, setSPReady] = useState(false);

  const setReady = useCallback(
    () => setSPReady(true),
    []
  );

  const openAnalysis = useCallback(
    () => {
      cs.send({ type: 'SHOW_T71_PAGE', page: `analysis/${serviceUUID}`, devMode: process.env.NODE_ENV === 'development' });
    },
    [cs, serviceUUID]
  );

  if (service) {

    return (
      <ServiceManifestContext.Provider value={{ manifest: state?.manifest, updateManifest: doNothing }}>
        <ServiceStateContext.Provider value={{ state, updateState }}>
          <ServiceProvider
            initialState={state}
            onReady={setReady}
            onSessionChange={onSessionChange}
            service={service}
          />
          {
            serviceProviderReady && (
              <Debouncer>
                <Analysis
                  analysisState={initialAnalysisState}
                  live
                  serviceUUID={serviceUUID}
                  sessionIndex={sessionIndex}
                />
                <StateStorer
                  serviceUUID={serviceUUID}
                  sessionIndex={sessionIndex}
                  />
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
                      {
                        process.env.NODE_ENV === 'development' && <span>[DEV]</span>
                      }
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

export default Timing;
