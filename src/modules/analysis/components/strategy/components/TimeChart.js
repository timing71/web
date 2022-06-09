import { Fragment, useCallback, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useAnalysis } from "../../context";
import { StintLayer } from './StintLayer';
import { HEADER_HEIGHT, ROW_HEIGHT } from "../constants";
import dayjs from "dayjs";
import { HeaderText } from "./HeaderText";
import { Gridline } from "./Gridline";
import { TimeChartFlags } from "./TimeChartFlags";


const TimeHeader = ({ height, maxTime, scale, startTime }) => {

  const marks = useMemo(
    () => {

      const result = [];

      const start = dayjs(startTime);
      const end = dayjs(maxTime);
      const startVal = start.valueOf();

      let next = start.startOf('hour');

      while (next <= end) {
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
                { dayjs(m + dayjs(startTime).valueOf()).format('HH:mm') }
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
      <HeaderText
        current
        x={scale(maxTime - startTime)}
        y={0}
      >
        { dayjs(maxTime).format('HH:mm') }
      </HeaderText>
      <Gridline
        current
        x1={scale(maxTime - startTime)}
        x2={scale(maxTime - startTime)}
        y1={HEADER_HEIGHT}
        y2={height}
      />
    </g>
  );
};

const ROUND_TO_15_MINS = 900000;

export const TimeChart = observer(
  ({ classFilter, scale, showStintDetails, window }) => {
    const analysis = useAnalysis();

    const cars = analysis.carsInRunningOrder.filter(c => !classFilter || c.classColorString === classFilter);;

    const height = cars.length * ROW_HEIGHT;
    const startTime = analysis.manifest.startTime;

    const duration = analysis.referenceTimestamp() - startTime;

    const xScale = useCallback(
      (time) => time / 360000 * scale * 5,
      [scale]
    );
    const width = Math.ceil(xScale(Math.ceil((duration / ROUND_TO_15_MINS) + 1) * ROUND_TO_15_MINS));

    const widthFunc = useCallback(
      (stint) => {
        const duration = stint.inProgress ? (analysis.referenceTimestamp() - stint.startTime) / 1000 : stint.durationSeconds;
        return Math.max(10, xScale(duration * 1000));
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
        referenceTimestamp={analysis.referenceTimestamp()}
        showPitStops
        width={width}
        widthFunc={widthFunc}
        window={window}
        xFunc={xFunc}
      >
        <svg
          height={height + HEADER_HEIGHT}
          style={{ position: 'absolute', left: 0, top: -HEADER_HEIGHT, zIndex: -1 }}
          width={width}
        >
          <TimeChartFlags
            height={height + HEADER_HEIGHT}
            referenceTimestamp={analysis.referenceTimestamp()}
            startTime={startTime}
            widthFunc={widthFunc}
            xFunc={xFunc}
          />
          <TimeHeader
            height={height + HEADER_HEIGHT}
            maxTime={analysis.referenceTimestamp()}
            scale={xScale}
            startTime={startTime}
          />
        </svg>
      </StintLayer>

    );
  }
);
