import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { timeWithHours } from "../../../formats";

const Inner = styled.div`
  justify-self: center;
  align-self: center;
`;

export const Clock = ({ caption, countdown, pause, seconds }) => {

  const refTime = useRef(Date.now());

  const [ actualSeconds, setActualSeconds ] = useState(seconds);

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
        const interval = window.setInterval(tick, 500);

        return () => {
          window.clearInterval(interval);
        };
      }
    },
    [pause, tick]
  );

  return (
    <Inner>
      { timeWithHours(actualSeconds) } { caption }
    </Inner>
  );
};
