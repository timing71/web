import { DriveShareChart } from "./DriveShareChart";

export const DriveShareByLaps = ({ raceNum }) => (
  <DriveShareChart
    label='Laps'
    labelWidth={50}
    raceNum={raceNum}
    valueFunction={d => d.totalLaps}
  />
);
