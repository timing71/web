import styled from "styled-components";
import { animated } from '@react-spring/web';

import { useAnalysis } from "../../context";
import { observer } from "mobx-react-lite";
import { useYPosTransition } from "./hooks";
import { CAR_LIST_WIDTH, ROW_HEIGHT, ROW_PADDING } from "../constants";

const CarBox = styled.rect.attrs(
  props => ({
    ...props,
    width: 250,
    x: 0,
    y: 0,
    rx: 3
  })
)`
  stroke: ${ props => (props.car && props.theme.classColours[props.car.classColorString]) || '#C0C0C0' };

  fill: ${ props => (props.car && props.car.state && props.theme.carStates[props.car.state]?.rowBackground && props.theme.carStates[props.car.state].rowBackground[0]) || 'black' };
  transition: fill 0.5s ease-in-out;
`;

const CarNum = styled.text.attrs(
  props => ({
    children: props.car.raceNum,
    dominantBaseline: 'middle',
    textAnchor: 'middle',
    x: 30,
  })
)`
  fill: ${ props => (props.car && props.theme.classColours[props.car.classColorString]) || '#C0C0C0' };
  font-size: 28px;
  font-family: ${ props => props.theme.site.headingFont };
`;

const Detail = styled.text.attrs(
  {
    dominantBaseline: 'middle'
  }
)`
  clip-path: polygon(0 0, 0 18px, 180px 18px, 180px 0);
  font-family: ${ props => props.theme.site.headingFont };
  font-size: 16px;
  fill: white;
`;

const CarsLayer = ({ cars }) => {
  const yPosTransition = useYPosTransition(cars);

  const height = ROW_HEIGHT - (2 * ROW_PADDING);

  return (
    <g
      className='cars-layer'
    >
      {
        yPosTransition(
          (style, car) => {
            return (
              <animated.g
                key={`car-${car.raceNum}`}
                {...style}
              >
                <CarBox
                  car={car}
                  height={height}
                />
                <CarNum
                  car={car}
                  y={Math.ceil(height / 2)}
                />
                <Detail
                  x={60}
                  y={20}
                >
                  {car.teamName}
                </Detail>
                <Detail
                  x={60}
                  y={height - 20}
                >
                  {car.make}
                </Detail>
              </animated.g>
            );
          }
        )
      }
    </g>
  );
};


export const CarsList = observer(
  () => {
    const analysis = useAnalysis();

    const cars = analysis.carsInRunningOrder;

    const height = (cars.length * 74);

    return (
      <svg
        height={height}
        width={CAR_LIST_WIDTH}
      >
        <CarsLayer cars={cars} />
      </svg>
    );
  }
);
