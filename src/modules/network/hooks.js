import { useCallback, useState, useEffect, useRef } from "react";

export const useDelayedState = (currentState, delay) => {
  const buffer = useRef([]);

  const [targetTime, setTargetTime] = useState();

  useEffect(
    () => {
      if (delay > 0) {
        const mostRecentTS = buffer.current[buffer.current.length - 1]?.[0];
        if (!mostRecentTS || currentState.lastUpdated >= mostRecentTS) {
          buffer.current.push([currentState.lastUpdated || Date.now(), currentState]);
        }
      }
    },
    [currentState, delay]
  );

  const updateTargetTime = useCallback(
    // We can't rely on a new currentState value triggering a new delayed output
    // - consider a 10s delay but with currentState only updating every 20s: in
    // that scenario we'd effectively have a delay of 20s. So, prod ourselves
    // every second to make sure we're showing the most recent state up to the
    // delay limit.
    () => {
      setTargetTime(Date.now() - (1000 * delay));
    },
    [delay]
  );

  useEffect(
    () => {
      const interval = setInterval(updateTargetTime, 1000);
      return () => {
        interval && clearInterval(interval);
      };
    }
  );

  if (delay === 0) {
    return currentState;
  }
  else {
    while (buffer.current.length > 0 && buffer.current[0][0] < targetTime) {
      buffer.current.shift();
    }

    return buffer.current[0]?.[1];
  }
};
