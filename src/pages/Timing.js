import { useCallback, useEffect, useState } from "react";
import { StackedBarChart } from '@styled-icons/material';

import withGracefulUnmount from "../components/withGracefulUnmount";
import { useConnectionService } from "../ConnectionServiceProvider";
import { ServiceParameters, TimingScreen } from "../modules/timingScreen";
import { ServiceManifestContext, ServiceStateContext } from "../components/ServiceContext";
import { StateStorer } from "../components/StateStorer";
import { Debouncer } from "../components/Debouncer";
import { StateRetriever } from "../components/StateRetriever";
import { useSetting } from '../modules/settings';
import { Analysis } from "../modules/analysis/components";
import { LoadingScreen } from "../components/LoadingScreen";
import { ServiceProvider } from "../modules/serviceHost";
import { SystemMessagesProvider } from "../modules/systemMessages";
import {
  DelayIndicator,
  DelaySetting,
  DonateLink,
  DownloadReplay,
  Menu,
  MenuBar,
  MenuSeparator,
  Spacer,
  SystemMessages,
  ToggleMenuItem,
  UpdateTime,
  ViewSettings,
  WallClock,
} from "../modules/menu";
import { FocusedCarIndicator } from '../modules/menu/components/FocusedCarIndicator';


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
  const [transientState, setTransientState] = useState(null);
  const [serviceParameters, setServiceParameters] = useState({});

  const cs = useConnectionService();

  useEffect(
    () => {

      cs.send({
        type: 'FETCH_SERVICE',
        uuid: serviceUUID
      }).then(
        msg => {
          setTransientState(msg.transient_data?.data);
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

  const storeTransientState = useCallback(
    (data) => {
      cs.send({
        type: 'SAVE_TRANSIENT_DATA',
        uuid: serviceUUID,
        data
      });
    },
    [cs, serviceUUID]
  );

  const onSessionChange = useCallback(
    (newIndex) => {
      setSessionIndex(newIndex || 0);
    },
    []
  );

  const onAnalysisData = useCallback(
    (data) => setInitialAnalysisState(data),
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
      <ServiceManifestContext.Provider value={{ manifest: state?.manifest, updateManifest: doNothing, setServiceParameters }}>
        <ServiceStateContext.Provider value={{ state, updateState }}>
          <SystemMessagesProvider>
            <ServiceProvider
              initialState={state}
              onAnalysisState={onAnalysisData}
              onReady={setReady}
              onSessionChange={onSessionChange}
              service={service}
              serviceParameters={serviceParameters}
              storeTransientState={storeTransientState}
              transientState={transientState}
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
                        <FocusedCarIndicator />
                        <Spacer />
                        <SystemMessages />
                        <DelayIndicator />
                        {
                          process.env.NODE_ENV === 'development' && <span>[DEV]</span>
                        }
                        {
                          state?.manifest?.parameters && (
                            <ServiceParameters />
                          )
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
                          <DonateLink />
                          <DownloadReplay />
                        </Menu>
                      </MenuBar>
                    </TimingScreen>
                  </StateRetriever>
                </Debouncer>
              )
            }
          </SystemMessagesProvider>
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
