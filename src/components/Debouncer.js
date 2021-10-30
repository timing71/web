import { useEffect, useRef, useState } from "react";
import { ServiceStateContext, useServiceState } from "./ServiceContext";

export const Debouncer = ({ children }) => {
  const { state, updateState } = useServiceState();
  const [debouncedState, setDebouncedState] = useState(state);
  const pendingState = useRef(state);

  useEffect(
    () => {
      pendingState.current = {
        ...state,
        highlight: [
          ...(pendingState.current.highlight || []),
          state.highlight
        ]
      };
    },
    [state]
  );

  useEffect(
    () => {
      const interval = window.setInterval(
        () => {
          setDebouncedState(pendingState.current);
          pendingState.current = { ...pendingState.current, highlight: [] };
        },
        1000
      );

      return () => {
        window.clearInterval(interval);
      };
    },
    []
  );

  return (
    <ServiceStateContext.Provider value={{ state: debouncedState, updateState }}>
      { children }
    </ServiceStateContext.Provider>
  );

};
