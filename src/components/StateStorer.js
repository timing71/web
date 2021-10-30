import { useContext, useEffect, useRef } from "react";
import { PluginContext } from "../modules/pluginBridge";
import { useServiceState } from "./ServiceContext";

export const StateStorer = ({ serviceUUID }) => {

  const port = useContext(PluginContext);
  const { state } = useServiceState();
  const lastStoreTime = useRef(0);

  useEffect(
    () => {
      const now = Date.now();

      if (lastStoreTime.current + 1000 <= now) {
        try {
          port.send({
            type: 'UPDATE_SERVICE_STATE',
            state,
            uuid: serviceUUID,
            timestamp: state.lastUpdated
          });
        }
        catch (error) {
          // sometimes we end up with a disconnected port here
        }
        lastStoreTime.current = now;
      }
    },
    [port, serviceUUID, state]
  );

  return null;

};
