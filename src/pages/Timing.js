import deepEqual from "deep-equal";
import { useCallback, useContext, useEffect, useState } from "react";
import withGracefulUnmount from "../components/withGracefulUnmount";
import { generateMessages } from "../modules/messages";
import { PluginContext } from "../modules/pluginBridge";
import { TimingScreen } from "../modules/timingScreen";
import { mapServiceProvider } from "../modules/services";
import { ServiceManifestContext, ServiceStateContext } from "../components/ServiceContext";
import { StateStorer } from "../components/StateStorer";
import { Debouncer } from "../components/Debouncer";
import { StateRetriever } from "../components/StateRetriever";
import { useSetting } from '../modules/settings';
import { Analysis } from "../modules/analysis";
import { LoadingScreen } from "../components/LoadingScreen";

const DEFAULT_STATE = {
  cars: [],
  session: {},
  messages: [],
  manifest: {}
};

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
        oldState => {
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
            ...oldState.messages
          ].slice(0, 100);

          newState.lastUpdated = Date.now();

          return newState;
        }
      );
    },
    []
  );

  const updateManifest = useCallback(
    (newManifest) => {

      const newManifestWithStartTime = {
        ...newManifest,
        startTime: service.startTime,
        uuid: serviceUUID
      };

      if (!deepEqual(newManifestWithStartTime, state.manifest)) {
        updateState({ manifest: newManifestWithStartTime });
      }
    },
    [service?.startTime, serviceUUID, state.manifest, updateState]
  );

  const [ delay ] = useSetting('delay');

  if (service && state && initialAnalysisState) {
    const ServiceProvider = mapServiceProvider(service.source);

    if (!ServiceProvider) {
      return <p>No service provider found for <cite>{service.source}</cite>!</p>;
    }

    return (
      <ServiceManifestContext.Provider value={{ manifest: state.manifest, updateManifest }}>
        <ServiceStateContext.Provider value={{ state, updateState }}>
          <ServiceProvider service={service} />
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
              <TimingScreen />
            </StateRetriever>
          </Debouncer>
        </ServiceStateContext.Provider>
      </ServiceManifestContext.Provider>
    );
  }

  return (
    <LoadingScreen message='Loading timing data...' />
  );
};

export const Timing = withGracefulUnmount(TimingInner);
