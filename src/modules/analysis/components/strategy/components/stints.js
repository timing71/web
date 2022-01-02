import { darken } from 'polished';
import styled from 'styled-components';
import { Text } from '@visx/text';

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
  }
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

const Stint = ({ height, stint, xScale }) => {

  const laps = stint.inProgress ? stint.car.currentLap - stint.startLap : stint.durationLaps;

  const width = Math.max(2, xScale(Math.max(0.5, laps)) - 6);

  const relevantLaps = stint.laps.slice(1, stint.inProgress ? undefined : -1); // ignore out and in laps

  const best = relevantLaps.length > 0 ? Math.min(
    ...relevantLaps.map(l => l.laptime)
  ) : null;

  const mean = relevantLaps.length > 0 ? (relevantLaps.map(l => l.laptime).reduce(sum, 0) / relevantLaps.length).toFixed(3) : null;

  return (
    <g transform={`translate(${xScale(stint.startLap - 1)}, 0)`}>
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
        overallWidth={width}
        width={width / 2}
        y={height - 12}
      >
        {`Best ${best ? dayjs.duration(Math.round(best * 1000)).format("m:ss.SSS") : '-'}`}
      </Best>
      <Mean
        overallWidth={width}
        width={width / 2}
        x={width - 8}
        y={height - 12}
      >
        {`Ave ${mean ? dayjs.duration(Math.round(mean * 1000)).format("m:ss.SSS") : '-'}`}
      </Mean>
    </g>
  );
};

export const stintsLayer = ({ bars, xScale }) => {
  return (
    <g
      className='stints-layer'
    >
      {
        bars.map(
          bar => {
            const car = bar.data.data;
            return (
              <g
                key={bar.key}
                transform={`translate(0, ${bar.y})`}
              >
                {
                  car.stints.map(
                    (stint, idx) => (
                      <Stint
                        height={bar.height}
                        key={idx}
                        stint={stint}
                        xScale={xScale}
                      />
                    )
                  )
                }
              </g>
            );
          }
        )
      }
    </g>
  );
};
