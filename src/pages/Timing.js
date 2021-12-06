import deepEqual from "deep-equal";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
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
import { createAnalyser } from "../modules/analysis";

const DEFAULT_STATE = {
  cars: [],
  session: {},
  messages: [],
  manifest: {}
};

const TimingInner = () => {

  const { serviceUUID } = useParams();
  const [service, setService] = useState(null);
  const [state, setState] = useState({ ...DEFAULT_STATE });
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

  const analyser = useRef(createAnalyser());
  const prevState = useRef(state);
  useEffect(
    () => {
      const newAnalysisState = analyser.current?.updateState(
        prevState.current,
        state
      );

      try {
        port.send({
          type: 'UPDATE_SERVICE_ANALYSIS',
          analysis: newAnalysisState,
          uuid: serviceUUID,
          timestamp: state.lastUpdated
        });
      }
      catch (error) {
        // sometimes we end up with a disconnected port here
      }
      prevState.current = state;
    },
    [port, serviceUUID, state]
  );

  useEffect(
    () => {

      port.send({
        type: 'FETCH_SERVICE',
        uuid: serviceUUID
      }).then(
        msg => {
          setService(msg.service);
          setState(msg.state);
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
          delete newState.extraMessages;

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

  if (service && state) {
    const ServiceProvider = mapServiceProvider(service.source);

    if (!ServiceProvider) {
      return <p>No service provider found for <cite>{service.source}</cite>!</p>;
    }

    return (
      <ServiceManifestContext.Provider value={{ manifest: state.manifest, updateManifest }}>
        <ServiceStateContext.Provider value={{ state, updateState }}>
          <ServiceProvider service={service} />
          <Debouncer>
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
    <p>Soon™: { serviceUUID } </p>
  );
};

export const Timing = withGracefulUnmount(TimingInner);
