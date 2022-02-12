import styled from "styled-components";
import { animated, useTransition } from '@react-spring/web';

import { useAnalysis } from "../../context";
import { observer } from "mobx-react-lite";
import { Bar } from "@nivo/bar";
import { useMotionConfig } from "@nivo/core";

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

export const CarsLayer = ({ bars }) => {

  const { animate, config: springConfig } = useMotionConfig();

  const yPosTransition = useTransition(
    bars,
    {
      keys: bar => bar.key,
      from: bar => ({
        transform: `translate(0, ${bar.y})`,
      }),
      update: bar => ({
        transform: `translate(0, ${bar.y})`
      }),
      config: springConfig,
      immediate: !animate
    }
  );

  return (
    <g
      className='cars-layer'
    >
      {
        yPosTransition(
          (style, bar) => {
            const car = bar.data.data;
            return (
              <animated.g
                key={`car-${car.raceNum}`}
                {...style}
              >
                <CarBox
                  car={car}
                  height={bar.height}
                />
                <CarNum
                  car={car}
                  y={Math.ceil(bar.height / 2)}
                />
                <Detail
                  x={60}
                  y={20}
                >
                  {car.teamName}
                </Detail>
                <Detail
                  x={60}
                  y={bar.height - 20}
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


export const CarsChart = observer(
  () => {
    const analysis = useAnalysis();

    const cars = [...analysis.carsInRunningOrder].reverse();

    const height = (cars.length * 74);

    return (
      <Bar
        axisBottom={null}
        axisLeft={null}
        axisTop={null}
        data={cars}
        enableGridX={false}
        enableGridY={false}
        height={height}
        indexBy={'raceNum'}
        keys={['currentLap']}
        layers={[CarsLayer]}
        layout='horizontal'
        margin={{ top: 22, right: 0, bottom: 30, left: 0 }}
        width={260}
      />
    );
  }
);
