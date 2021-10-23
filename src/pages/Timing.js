import deepEqual from "deep-equal";
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import withGracefulUnmount from "../components/withGracefulUnmount";
import { generateMessages } from "../messages";
import { PluginContext } from "../modules/pluginBridge";
import { TimingScreen } from "../modules/timingScreen";
import { mapServiceProvider } from "../modules/services";

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

          try {
            port.send({
              type: 'UPDATE_SERVICE_STATE',
              state: newState,
              uuid: serviceUUID,
              timestamp: newState.lastUpdated
            });
          }
          catch (error) {
            // sometimes we end up with a disconnected port here
          }
          return newState;
        }
      );
    },
    [port, serviceUUID]
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
      <ServiceProvider
        service={service}
        state={state}
        updateManifest={updateManifest}
        updateState={updateState}
      >
        <TimingScreen
          state={state}
        />
      </ServiceProvider>
    );
  }

  return (
    <p>Soon™: { serviceUUID } </p>
  );
};

export const Timing = withGracefulUnmount(TimingInner);
