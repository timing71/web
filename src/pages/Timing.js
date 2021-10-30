import deepEqual from "deep-equal";
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import withGracefulUnmount from "../components/withGracefulUnmount";
import { generateMessages } from "../messages";
import { PluginContext } from "../modules/pluginBridge";
import { TimingScreen } from "../modules/timingScreen";
import { mapServiceProvider } from "../modules/services";
import { ServiceManifestContext, ServiceStateContext } from "../components/ServiceContext";
import { StateStorer } from "../components/StateStorer";
import { Debouncer } from "../components/Debouncer";

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

          const newMessages = generateMessages(newState.manifest, oldState, newState);

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
      if (!deepEqual(newManifest, state.manifest)) {
        updateState({ manifest: newManifest });
      }
    },
    [state.manifest, updateState]
  );

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
            <TimingScreen />
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
