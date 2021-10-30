import { useCallback, useContext, useEffect, useState } from "react";
import { PluginContext } from "../modules/pluginBridge";
import { ServiceStateContext, useServiceState } from "./ServiceContext";

const DEFAULT_STATE = {
  cars: [],
  session: {},
  messages: [],
  manifest: {}
};

export const StateRetriever = ({ children, delay=0, serviceUUID }) => {
  const [state, setState] = useState(DEFAULT_STATE);

  const port = useContext(PluginContext);

  const upstream = useServiceState();

  const updateState = useCallback(
    () => {

      const timestamp = Date.now() - delay;

      port.send({
        type: 'FETCH_SERVICE',
        uuid: serviceUUID,
        timestamp: timestamp
      }).then(
        s => {
          //console.log(`Got state for ${dayjs(timestamp).format("HH:mm:ss")} (delay ${delay})`, dayjs(s.state.lastUpdated).format("HH:mm:ss"));
          setState({ ...s.state, delay });
        }
      );
    },
    [delay, port, serviceUUID]
  );

  useEffect(
    () => {
      if (delay > 0) {
        const interval = window.setInterval(updateState, 1000);
        return () => {
          window.clearInterval(interval);
        };
      }
    },
    [delay, updateState]
  );

  const neededState = (delay > 0) ? state : upstream.state;

  return (
    <ServiceStateContext.Provider value={{ state: neededState }}>
      { children }
    </ServiceStateContext.Provider>
  );
};
