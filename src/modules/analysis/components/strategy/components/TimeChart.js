import { Fragment, useCallback, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useAnalysis } from "../../context";
import { StintLayer } from './StintLayer';
import { HEADER_HEIGHT, ROW_HEIGHT } from "../constants";
import styled from "styled-components";
import dayjs from "dayjs";

const HeaderText = styled.text`
  fill: ${ props => props.theme.site.highlightColor };
  font-family: ${ props => props.theme.site.headingFont };
  text-anchor: middle;
  dominant-baseline: hanging;
`;

const Gridline = styled.line`
  stroke: ${ props => props.theme.site.highlightColor };
`;

const TimeHeader = ({ height, maxTime, scale, startTime }) => {

  const marks = useMemo(
    () => {

      const result = [];

      const start = dayjs(startTime);
      const end = dayjs(maxTime);
      const startVal = start.valueOf();

      let next = start.startOf('hour');

      while (next < end) {
        result.push(next.valueOf() - startVal);
        next = next.add(15, 'minute');
      }

      result.push(next.valueOf() - startVal);

      return result;
    },
    [maxTime, startTime]
  );


  return (
    <g className='stints-header'>
      {
        marks.map(
          m => (
            <Fragment key={m}>
              <HeaderText
                x={scale(m)}
                y={0}
              >
                { dayjs(m + startTime).format('HH:mm') }
              </HeaderText>
              <Gridline
                x1={scale(m)}
                x2={scale(m)}
                y1={HEADER_HEIGHT}
                y2={height}
              />
            </Fragment>
          )
        )
      }
    </g>
  );
};

const RIGHT_HAND_PADDING = 50;

export const TimeChart = observer(
  ({ scale, showStintDetails, window }) => {
    const analysis = useAnalysis();

    const cars = analysis.carsInRunningOrder;

    const height = (cars.length * ROW_HEIGHT - 50);
    const startTime = analysis.manifest.startTime * 1000;

    const duration = analysis.referenceTimestamp() - startTime;

    const xScale = useCallback(
      (time) => time / 360000 * scale * 5,
      [scale]
    );
    const width = Math.ceil(xScale(duration)) + RIGHT_HAND_PADDING;

    const widthFunc = useCallback(
      (stint) => {
        const duration = stint.inProgress ? (analysis.referenceTimestamp() - stint.startTime) / 1000 : stint.durationSeconds;
        return xScale(duration * 1000);
      },
      [analysis, xScale]
    );

    const xFunc = useCallback(
      (stint) => xScale(stint.startTime - startTime),
      [startTime, xScale]
    );

    return (
      <StintLayer
        cars={cars}
        height={height}
        onClick={showStintDetails}
        width={width}
        widthFunc={widthFunc}
        window={window}
        xFunc={xFunc}
      >
        <svg
          height={height}
          style={{ position: 'absolute', left: 0, top: -HEADER_HEIGHT, zIndex: -1 }}
          width={width}
        >
          <TimeHeader
            height={height}
            maxTime={analysis.referenceTimestamp()}
            scale={xScale}
            startTime={startTime}
          />
        </svg>
      </StintLayer>

    );
  }
);
