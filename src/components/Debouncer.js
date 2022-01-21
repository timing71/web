import { useEffect, useRef, useState } from "react";
import { ServiceStateContext, useServiceState } from "./ServiceContext";

export const Debouncer = ({ children, minInterval=1000 }) => {
  const { state, updateState } = useServiceState();
  const [debouncedState, setDebouncedState] = useState(state);
  const pendingState = useRef(state);
  const pendingHighlights = useRef([]);
  const lastUpdate = useRef(0);
  const hasUpdated = useRef(false);

  useEffect(
    () => {
      pendingState.current = state;
      pendingHighlights.current = [...pendingHighlights.current, ...(state.highlight || [])];
      hasUpdated.current = true;
    },
    [state]
  );

  useEffect(
    () => {
      const interval = window.setInterval(
        () => {
          if (hasUpdated.current) {
            const now = Date.now();
            if (now - lastUpdate.current >= minInterval) {
              setDebouncedState({
                ...pendingState.current,
                highlight: [...pendingHighlights.current]
              });
              pendingHighlights.current = [];
              lastUpdate.current = now;
              hasUpdated.current = false;
            }
          }
        },
        minInterval / 2
      );

      return () => {
        window.clearInterval(interval);
      };
    },
    [minInterval]
  );

  return (
    <ServiceStateContext.Provider value={{ state: debouncedState, updateState }}>
      { children }
    </ServiceStateContext.Provider>
  );

};
