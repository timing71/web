import { useCallback } from "react";
import { Bar } from "@nivo/bar";
import { observer } from "mobx-react-lite";
import { theme } from "../../../charts";
import { useAnalysis } from "../../context";
import { StintsLayer } from "./stints";

const LapStintsLayer = ({ xScale, ...props }) => {

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
    <StintsLayer
      widthFunc={widthFunc}
      xFunc={xFunc}
      {...props}
    />
  );
};

export const LapsChart = observer(
  ({ scale }) => {
    const analysis = useAnalysis();

    const cars = [...analysis.carsInRunningOrder].reverse();

    const height = (cars.length * 74) - 12;
    const width = (Math.ceil(analysis.session.leaderLap / 10) * 10 * scale) + 250;

    const tickValues = [...Array(Math.ceil(analysis.session.leaderLap / 10)).keys()].map(t => (t + 1) * 10);

    const lapsAxis = {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      tickValues
    };

    return (
      <Bar
        axisBottom={lapsAxis}
        axisLeft={null}
        axisTop={lapsAxis}
        data={cars}
        enableGridX={true}
        enableGridY={true}
        gridXValues={tickValues}
        height={height}
        indexBy={'raceNum'}
        keys={['currentLap']}
        layers={['grid', 'axes', LapStintsLayer]}
        layout='horizontal'
        margin={{ top: 20, right: 30, bottom: 30, left: 0 }}
        maxValue={Math.ceil(analysis.session.leaderLap / 10) * 10}
        minValue={0}
        theme={theme}
        width={width}
      />
    );
  }
);
