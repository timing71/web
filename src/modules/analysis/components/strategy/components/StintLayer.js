import { animated } from "@react-spring/web";
import { useCallback } from "react";
import { OVERSCAN_PERCENT, ROW_HEIGHT, ROW_PADDING } from "../constants";
import { CarStints } from "./CarStints";
import { useYPosTransition } from "./hooks";

export const StintLayer = ({ cars, onClick, widthFunc, window, xFunc }) => {

  const yPosTransition = useYPosTransition(cars);

  const cull = useCallback(
    (stints) => {
      const min = window[0] * (1 - (OVERSCAN_PERCENT / 100));
      const max = window[1] * (1 + (OVERSCAN_PERCENT / 100));
      return stints.filter(
        (s) => {
          const width = widthFunc(s);
          const x = xFunc(s);

          return (x + width) >= min && x < max;
        }
      );
    },
    [widthFunc, window, xFunc]
  );

  return (
    <g
      className='stints-layer'
    >
      {
        yPosTransition(
          (style, car) => {
            return (
              <animated.g
                key={car.raceNum}
                {...style}
              >
                <CarStints
                  height={ROW_HEIGHT - (2 * ROW_PADDING)}
                  onClick={onClick}
                  stints={cull(car.stints)}
                  widthFunc={widthFunc}
                  xFunc={xFunc}
                />
              </animated.g>
            );
          }
        )
      }
    </g>
  );
};
