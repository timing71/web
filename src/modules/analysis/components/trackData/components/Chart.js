import { ResponsiveLine } from "@nivo/line";
import { dayjs } from '@timing71/common';
import { theme as chartTheme } from '../../../charts';


export const Chart = ({ series }) => {

  const chartData = [{
    id: series.label,
    data: series.data.map(d => ({ x: d.timestamp, y: d.value }))
  }];

  const formatTime = (t) => dayjs(t).format('HH:mm');

  const minValue = Math.min(...chartData[0].data.map(d => d.y));
  const maxValue = Math.max(...chartData[0].data.map(d => d.y), minValue + 10);

  return (
    <div>
      <h2>{series.label} ({series.unit.trim()})</h2>
      <ResponsiveLine
        axisBottom={{
          tickRotation: -60,
          format: formatTime
        }}
        colors={[ '#54ffff', '#ffa600', '#008000', '#a8dc5b', '#54f8cf', '#7cec96', '#d4c523' ]}
        curve='stepAfter'
        data={chartData}
        enablePoints={false}
        margin={{ top: 10, bottom: 80, left: 50, right: 10 }}
        theme={chartTheme}
        xFormat={formatTime}
        xScale={{ type: 'time' }}
        yScale={{
          max: Math.ceil(maxValue / 10) * 10,
          min: Math.floor(minValue / 10) * 10,
          type: 'linear'
        }}
      />
    </div>
  );
};
