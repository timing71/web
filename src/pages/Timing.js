import { useCallback, useContext } from "react";
import { useParams } from "react-router";
import { useEffect, useState } from "react/cjs/react.development";
import withGracefulUnmount from "../components/withGracefulUnmount";
import { PluginContext } from "../modules/pluginBridge";
import { mapServiceProvider } from "../modules/services";

export const Timing = withGracefulUnmount(
  () => {

    const { serviceUUID } = useParams();
    const [service, setService] = useState(null);
    const [state, setState] = useState(null);
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

    if (service && state) {
      const ServiceProvider = mapServiceProvider(service.source);
      return (
        <ServiceProvider
          service={service}
          state={state}
          updateState={updateState}
        />
      );
    }

    return (
      <p>Soon™: { serviceUUID } </p>
    );
  }
);
