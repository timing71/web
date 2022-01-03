import { darken } from 'polished';
import styled from 'styled-components';
import { Text } from '@visx/text';
import { animated, useTransition } from '@react-spring/web';
import { useMotionConfig } from '@nivo/core';

import dayjs from '../../../../../datetime';

const StintBox = styled.rect.attrs({
  x: 3,
  y: 2,
  rx: 3
})`
  fill: ${
    props => (
      props.car && darken(
        props.inProgress ? 0.25 : 0.35,
        props.theme.classColours[(props.car.raceClass || '').toLowerCase().replace(/[-/ ]/, '')] || '#808080'
      )
    )
  };

  &:hover {
    fill: ${
      props => (
        props.car && darken(
          props.inProgress ? 0.15 : 0.25,
          props.theme.classColours[(props.car.raceClass || '').toLowerCase().replace(/[-/ ]/, '')] || '#808080'
        )
      )
    };
  }

  transition: fill 0.15s ease-in-out;

  user-select: none;
  cursor: pointer;
`;

const StintText = styled(Text).attrs({
  scaleToFit: 'shrink-only'
})`
  fill: white;
  font-family: ${ props => props.theme.site.headingFont };
`;

const DriverName = styled(StintText).attrs(props => ({
  x: 10,
  y: 10,
  dominantBaseline: 'hanging',
  style: {
    clipPath: `polygon(0 0, 0 18px, ${props.overallWidth / 2}px 18px, ${props.overallWidth / 2}px 0)`
  },
  overallWidth: undefined
}))`
  font-weight: bold;
`;

const LapCount = styled(StintText).attrs({
  y: 10,
  dominantBaseline: 'hanging',
  textAnchor: 'end'
})``;

const Best = styled(StintText).attrs({
  x: 10,
  dominantBaseline: 'auto',
  textAnchor: 'start'
})``;

const Mean = styled(StintText).attrs({
  dominantBaseline: 'auto',
  textAnchor: 'end'
})``;

const sum = (acc, val) => acc + val;

const Stint = ({ height, stint, width, x }) => {

  const laps = stint.inProgress ? stint.car.currentLap - stint.startLap : stint.durationLaps;

  const relevantLaps = stint.laps.slice(1, stint.inProgress ? undefined : -1); // ignore out and in laps

  const best = relevantLaps.length > 0 ? Math.min(
    ...relevantLaps.map(l => l.laptime)
  ) : null;

  const mean = relevantLaps.length > 0 ? (relevantLaps.map(l => l.laptime).reduce(sum, 0) / relevantLaps.length).toFixed(3) : null;

  return (
    <g transform={`translate(${x}, 0)`}>
      <StintBox
        car={stint.car}
        height={height - 4}
        inProgress={stint.inProgress}
        width={width}
      />
      <DriverName
        overallWidth={width}
      >
        { stint.driver.name }
      </DriverName>
      <LapCount
        width={width / 2}
        x={width - 8}
      >
        {`${laps} lap${laps === 1 ? '' : 's'}`}
      </LapCount>
      <Best
        width={width / 2}
        y={height - 12}
      >
        {`Best ${best ? dayjs.duration(Math.round(best * 1000)).format("m:ss.SSS") : '-'}`}
      </Best>
      <Mean
        width={width / 2}
        x={width - 8}
        y={height - 12}
      >
        {`Ave ${mean ? dayjs.duration(Math.round(mean * 1000)).format("m:ss.SSS") : '-'}`}
      </Mean>
    </g>
  );
};

const AnimatedStint = animated(Stint);

export const CarStints = ({ height, stints, widthFunc, xFunc }) => {

  const { animate, config: springConfig } = useMotionConfig();

  const transition = useTransition(
    stints,
    {
      from: stint => ({
        width: widthFunc(stint),
      }),
      update: stint => ({
        width: widthFunc(stint),
      }),
      config: springConfig,
      immediate: !animate
    }
  );

  return (
    <>
      {
        transition(
          (style, stint) => (
            <AnimatedStint
              height={height}
              stint={stint}
              x={xFunc(stint)}
              {...style}
            />
          )
        )
      }
    </>
  );
};

export const StintsLayer = ({ bars, widthFunc, xFunc }) => {

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
      className='stints-layer'
    >
      {
        yPosTransition(
          (style, bar) => {
            const car = bar.data.data;
            return (
              <animated.g
                key={bar.key}
                {...style}
              >
                <CarStints
                  height={bar.height}
                  stints={car.stints}
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
