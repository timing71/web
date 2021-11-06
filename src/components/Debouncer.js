import { useEffect, useRef, useState } from "react";
import { ServiceStateContext, useServiceState } from "./ServiceContext";

export const Debouncer = ({ children }) => {
  const { state, updateState } = useServiceState();
  const [debouncedState, setDebouncedState] = useState(state);
  const pendingState = useRef(state);
  const pendingHighlights = useRef([]);

  useEffect(
    () => {
      pendingState.current = state;
      pendingHighlights.current = [...pendingHighlights.current, ...(state.highlight || [])];
    },
    [state]
  );

  useEffect(
    () => {
      const interval = window.setInterval(
        () => {
          setDebouncedState({
            ...pendingState.current,
            highlight: [...pendingHighlights.current]
          });
          pendingHighlights.current = [];
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
