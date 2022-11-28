import { dayjs } from '@timing71/common';

import { DriveShareChart } from "./DriveShareChart";


export const DriveShareByTime = ({ raceNum }) => (
  <DriveShareChart
    label='Time'
    labelWidth={60}
    raceNum={raceNum}
    valueFormat={v => dayjs.duration(v).format('HH:mm:ss')}
    valueFunction={(d, ts) => d.driveTime(ts) * 1000}
  />
);
