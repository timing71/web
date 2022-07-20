import { useEffect, useRef } from "react";
import { useConnectionService } from "../ConnectionServiceProvider";
import { useServiceState } from "./ServiceContext";

export const StateStorer = ({ serviceUUID }) => {

  const cs = useConnectionService();
  const { state } = useServiceState();
  const lastStoreTime = useRef(0);

  useEffect(
    () => {
      const now = Date.now();

      if (lastStoreTime.current + 1000 <= now) {
        // console.log("Saving state at time", state.lastUpdated)
        try {
          cs.send({
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
    [cs, serviceUUID, state]
  );

  return null;

};
