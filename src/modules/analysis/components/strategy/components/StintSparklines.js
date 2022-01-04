import { Sparklines, SparklinesLine } from "react-sparklines";
import { FlagState } from "../../../../../racing";

export const StintSparklines = ({ height, stint, width }) => {
  const applicableLaps = stint.laps.slice(1, stint.inProgress ? undefined : -1);

  if (applicableLaps.length === 0) {
    return null;
  }

  const greenLaps = applicableLaps.filter(l => l.flag === FlagState.GREEN);
  const greenLapTimes = greenLaps.map(l => l.laptime);
  const max = Math.max(...greenLapTimes);
  const min = Math.min(...greenLapTimes);

  return (
    <Sparklines
      data={applicableLaps.map(l => l.laptime)}
      height={height}
      max={max}
      min={min}
      style={{
        position: 'absolute'
      }}
      width={width}
    >
      <SparklinesLine color='#909090' />
    </Sparklines>
  );
};
