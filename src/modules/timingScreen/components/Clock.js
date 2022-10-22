import { timeWithHours } from '@timing71/common';
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

export const ClockInner = styled.div`
  justify-self: center;
  align-self: center;

  &.left {
    grid-column: 1;
  }

  &.right {
    grid-column: 4;
  }
`;

export const Clock = ({ caption, className, countdown, pause, seconds }) => {

  const refTime = useRef(Date.now());

  const [ actualSeconds, setActualSeconds ] = useState(seconds);

  useEffect(
    () => {
      refTime.current = Date.now();
    },
    [seconds]
  );

  const tick = useCallback(
    () => {
      const delta = (countdown ? -1 : 1) * (Date.now() - refTime.current) / 1000;
      setActualSeconds(Math.max(0, seconds + delta));
    },
    [countdown, seconds, setActualSeconds]
  );

  useEffect(
    () => {
      if (!pause) {
        const interval = window.setInterval(tick, 100);

        return () => {
          window.clearInterval(interval);
        };
      }
    },
    [pause, tick]
  );

  return (
    <ClockInner className={className}>
      { timeWithHours(actualSeconds) } { caption }
    </ClockInner>
  );
};
