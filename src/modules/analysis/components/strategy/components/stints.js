import { darken } from 'polished';
import styled from 'styled-components';

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

const StintText = styled.text`
  fill: white;
  font-family: ${ props => props.theme.site.headingFont };
`;

const DriverName = styled(StintText).attrs({
  x: 10,
  y: 10,
  dominantBaseline: 'hanging'
})`
  font-weight: bold;
  clip-path: ${ props => `polygon(0 0, 0 18px, ${props.overallWidth / 2}px 18px, ${props.overallWidth / 2}px 0)` };
`;

const LapCount = styled(StintText).attrs({
  y: 10,
  dominantBaseline: 'hanging',
  textAnchor: 'end'
})``;

const Stint = ({ height, stint, xScale }) => {

  const laps = stint.inProgress ? 1 + stint.car.currentLap - stint.startLap : stint.durationLaps;

  const width = Math.max(2, xScale(laps) - 6);

  return (
    <g transform={`translate(${xScale(stint.startLap - 1)}, 0)`}>
      <StintBox
        car={stint.car}
        height={height - 4}
        inProgress={stint.inProgress}
        width={width}
      />
      <DriverName overallWidth={width}>
        { stint.driver.name }
      </DriverName>
      <LapCount x={width - 8}>
        {laps} lap{laps === 1 ? '' : 's'}
      </LapCount>
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
