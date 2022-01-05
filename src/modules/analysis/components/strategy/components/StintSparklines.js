import { Sparklines, SparklinesLine } from "react-sparklines";
import { FlagState } from "../../../../../racing";

export const StintSparklines = ({ height, stint, width }) => {
  const greenLaps = stint.relevantLaps.filter(l => l.flag === FlagState.GREEN);
  if (greenLaps.length === 0) {
    return null;
  }

  const greenLapTimes = greenLaps.map(l => l.laptime);
  const max = Math.max(...greenLapTimes);
  const min = Math.min(...greenLapTimes);

  return (
    <Sparklines
      data={stint.relevantLaps.map(l => l.laptime)}
      height={height}
      max={max}
      min={min}
      style={{
        pointerEvents: 'none',
        position: 'absolute'
      }}
      width={width}
    >
      <SparklinesLine color='#909090' />
    </Sparklines>
  );
};
