import { animated } from "@react-spring/web";
import { useCallback } from "react";
import styled from "styled-components";
import { HEADER_HEIGHT, OVERSCAN_PERCENT, ROW_HEIGHT, ROW_PADDING } from "../constants";
import { CarStints } from "./CarStints";
import { useYPosTransition } from "./hooks";

const StintLayerInner = styled.div.attrs(
  props => ({
    style: {
      height: props._height,
      width: props._width
    }
  })
)`
  position: relative;
  margin-top: ${ HEADER_HEIGHT }px;

  transform: translateY(${ ROW_PADDING }px);

  z-index: 1;
`;

const CarStintsContainer = styled(animated.div)`

  position: absolute;

  height: ${ROW_HEIGHT - (2 * ROW_PADDING)}px;
  width: 100%;

  border: 1px solid transparent;
`;


export const StintLayer = ({ cars, children, height, onClick, width, widthFunc, window, xFunc }) => {

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
    <StintLayerInner
      _height={height}
      _width={width}
    >
      {
        children
      }
      {
        yPosTransition(
          (style, car) => {
            return (
              <CarStintsContainer
                key={car.raceNum}
                style={style}
              >
                <CarStints
                  height={ROW_HEIGHT - (2 * ROW_PADDING)}
                  onClick={onClick}
                  stints={cull(car.stints)}
                  widthFunc={widthFunc}
                  xFunc={xFunc}
                />
              </CarStintsContainer>
            );
          }
        )
      }
    </StintLayerInner>
  );
};
