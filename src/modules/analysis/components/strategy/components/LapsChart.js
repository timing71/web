import { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useAnalysis } from "../../context";
import { StintLayer } from './StintLayer';
import { HEADER_HEIGHT, ROW_HEIGHT } from "../constants";
import styled from "styled-components";

const HeaderText = styled.text`
  fill: ${ props => props.theme.site.highlightColor };
  font-family: ${ props => props.theme.site.headingFont };
  text-anchor: middle;
  dominant-baseline: hanging;
`;

const Gridline = styled.line`
  stroke: ${ props => props.theme.site.highlightColor };
`;

const LapsHeader = ({ height, maxLaps, scale }) => {

  const tickValues = [
    ...Array(
        Math.max(0, Math.ceil(maxLaps / 10))
      ).keys()
  ].map(t => (t + 1) * 10);

  return (
    <g className='stints-header'>
      {
        tickValues.map(
          tick => (
            <>
              <Gridline
                key={tick}
                x1={scale * tick}
                x2={scale * tick}
                y1={HEADER_HEIGHT}
                y2={height}
              />
              <HeaderText
                key={`${tick}_text`}
                x={scale * tick}
                y={0}
              >
                Lap {tick}
              </HeaderText>
            </>
          )
        )
      }
    </g>
  );
};

const RIGHT_HAND_PADDING = 50;

export const LapsChart = observer(
  ({ scale, showStintDetails, window }) => {
    const analysis = useAnalysis();

    const cars = analysis.carsInRunningOrder;

    const height = (cars.length * ROW_HEIGHT - 50);
    const width = (Math.ceil(analysis.session.leaderLap / 10) * 10 * scale) + RIGHT_HAND_PADDING;


    const xScale = useCallback(
      (lap) => lap * scale,
      [scale]
    );

    const widthFunc = useCallback(
      (stint) => {
        const laps = stint.inProgress ? stint.car.currentLap - stint.startLap : stint.durationLaps;
        return Math.max(2, xScale(Math.max(0.5, laps)) - 6);
      },
      [xScale]
    );

    const xFunc = useCallback(
      (stint) => xScale(stint.startLap - 1),
      [xScale]
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
          <LapsHeader
            height={height}
            maxLaps={analysis.session.leaderLap}
            scale={scale}
          />
        </svg>
      </StintLayer>

    );
  }
);
