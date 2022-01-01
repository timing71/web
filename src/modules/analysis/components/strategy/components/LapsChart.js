import { Bar } from "@nivo/bar";
import { observer } from "mobx-react-lite";
import { theme } from "../../../charts";
import { useAnalysis } from "../../context";
import { carsLayer } from "./cars";

export const LapsChart = observer(
  ({ scale }) => {
    const analysis = useAnalysis();

    const cars = [...analysis.carsInRunningOrder].reverse();

    const height = cars.length * 72;
    const width = (Math.ceil(analysis.session.leaderLap / 10) * 10 * scale) + 250;

    const lapsAxis = {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      tickValues: [...Array(Math.ceil(analysis.session.leaderLap / 10)).keys()].map(t => (t + 1) * 10)
    };

    return (
      <Bar
        axisBottom={lapsAxis}
        axisLeft={null}
        axisTop={lapsAxis}
        data={cars}
        height={height}
        indexBy={'raceNum'}
        keys={['currentLap']}
        layers={['grid', 'axes', carsLayer]}
        layout='horizontal'
        margin={{ top: 30, right: 30, bottom: 30, left: 250 }}
        maxValue={Math.ceil(analysis.session.leaderLap / 10) * 10}
        minValue={0}
        theme={theme}
        width={width}
      />
    );
  }
);
