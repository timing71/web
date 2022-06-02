import styled from 'styled-components';
import { animated } from '@react-spring/web';
import dayjs from 'dayjs';
import { darken } from 'polished';

import { StintSparklines } from './StintSparklines';

const Container = styled.div.attrs(
  props => ({
    style: {
      height: props._height,
      width: props._width,
      position: 'absolute',
      left: props.x
    }
  })
)`

  display: inline-flex;
  flex-direction: column;

  border-radius: 0.25em;

  background: ${
    props => (
      props.car && darken(
        props.inProgress ? 0.25 : 0.35,
        props.theme.classColours[props.car.classColorString] || '#808080'
      )
    )
  };

  &:hover {
    background: ${
      props => (
        props.car && darken(
          props.inProgress ? 0.15 : 0.25,
          props.theme.classColours[props.car.classColorString] || '#808080'
        )
      )
    };
  }

  transition: fill 0.15s ease-in-out;

  user-select: none;
  cursor: pointer;
`;

const Line = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 1 50%;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5em;
  overflow: hidden;
`;

const Text = styled.div`
  color: white;
  font-family: ${ props => props.theme.site.headingFont };
  font-weight: ${ props => props.bold ? 'bold' : 'normal' };
  text-align: ${ props => props.right ? 'right' : 'left' };
  flex: 0 1 0;
  white-space: nowrap;

  z-index: 2;

  &:first-child {
    margin-right: 0.25em;
  }
`;

export const StintBox = animated(
  ({ height, onClick, stint, width, x }) => {

    const laps = stint.inProgress ? stint.car.currentLap - stint.startLap : stint.durationLaps;

    const best = stint.bestLap;
    const mean = stint.meanLap;

    return (
      <Container
        _height={height}
        _width={width}
        car={stint.car}
        onClick={(e) => onClick(stint, e)}
        x={x}
      >
        <StintSparklines
          height={height}
          stint={stint}
          width={width}
        />
        <Line>
          <Text bold>{stint.driver?.name || 'Unknown driver'}</Text>
          <Text
            bold
            right
          >
            {laps} lap{laps === 1 ? '' : 's'}
          </Text>
        </Line>
        <Line>
          <Text>Best {best ? dayjs.duration(Math.round(best * 1000)).format("m:ss.SSS") : '-'}</Text>
          <Text right>Ave {mean ? dayjs.duration(Math.round(mean * 1000)).format("m:ss.SSS") : '-'}</Text>
        </Line>
      </Container>
    );
  }
);
