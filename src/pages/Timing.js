import deepEqual from "deep-equal";
import { useCallback, useContext } from "react";
import { useParams } from "react-router";
import { useEffect, useState } from "react/cjs/react.development";
import withGracefulUnmount from "../components/withGracefulUnmount";
import { generateMessages } from "../messages";
import { PluginContext } from "../modules/pluginBridge";
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
      port.onMessage.addListener(
        (msg) => {
          if (msg.type === 'FETCH_SERVICE_RETURN' && msg.service.uuid === serviceUUID) {
            setService(msg.service);
            setState(msg.state);
          }
        }
      );
      port.postMessage({
        type: 'FETCH_SERVICE',
        uuid: serviceUUID
      });

    },
    [port, serviceUUID]
  );

  const updateState = useCallback(
    (updatedState) => {
      setState(
        oldState => {
          const newState = { ...oldState, ...updatedState };

          newState.messages = [
            generateMessages(newState.manifest, oldState, newState),
            ...oldState.messages
          ].slice(0, 100);

          port.postMessage({
            type: 'UPDATE_SERVICE_STATE',
            state: newState
          });
          return newState;
        }
      );
    },
    [port]
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
    return (
      <ServiceProvider
        state={state}
        updateManifest={updateManifest}
        updateState={updateState}
      />
    );
  }

  return (
    <p>Soon™: { serviceUUID } </p>
  );
};

export const Timing = withGracefulUnmount(TimingInner);
