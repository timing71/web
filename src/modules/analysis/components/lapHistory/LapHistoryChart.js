import { observer } from 'mobx-react-lite';
import { FlagState } from '@timing71/common';

import { LaptimeChart } from '../LaptimeChart';

export const LapHistoryChart = observer(
  ({ car }) => {
    const data = car.stints.flatMap(s => s.laps);

    const maxLaptime = Math.max(
      ...car.stints.flatMap(s => s.relevantLaps)
      .filter(l => l.flag === FlagState.GREEN)
      .map(l => l.laptime)
    );

    return (
      <div style={{ overflow: 'hidden' }}>
        <LaptimeChart
          axisTop={false}
          canvas
          laps={data}
          maxValue={maxLaptime}
        />
      </div>
    );
  }
);
