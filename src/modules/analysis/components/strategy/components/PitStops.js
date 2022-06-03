import styled from 'styled-components';
import { animated, useTransition } from '@react-spring/web';
import dayjs from 'dayjs';

const PitStopInner = styled(animated.div).attrs(
  props => ({
    style: {
      ...props.style,
      transform: `translateX(${props._x}px)`
    }
  })
)`
  border: 1px solid red;
  border-left: 0;
  border-right: 0;
  position: absolute;
  margin-top: 16px;

  background-color: rgba(0, 0, 0, 0.75);

  padding: 0.25em 0;
  text-align: center;
  overflow-x: hidden;
  white-space: nowrap;
`;

const PitStop = ({ referenceTimestamp, stop, x, style }) => {

  const duration = stop.durationSeconds ? stop.durationSeconds : (referenceTimestamp - stop.startTime) / 1000;

  return (
    <PitStopInner
      _x={x}
      style={style}
    >
      { dayjs.duration(Math.round(duration * 1000)).format("m:ss") }
    </PitStopInner>
  );
};

export const PitStops = ({ referenceTimestamp, stops, widthFunc, xFunc }) => {

  const transition = useTransition(
    stops,
    {
      from: stop => ({
        width: widthFunc(stop),
      }),
      update: stop => ({
        width: widthFunc(stop),
      })
    }
  );

  return (
    <>
      {
        transition(
          (style, stop) => (
            <PitStop
              referenceTimestamp={referenceTimestamp}
              stop={stop}
              style={style}
              x={xFunc(stop)}
            />
          )
        )
      }
    </>
  );
};
