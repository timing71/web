import { ResponsiveBar } from '@nivo/bar';

import dayjs from '../../../../../datetime';

import { theme as chartTheme } from '../../../charts';
import { Theme as siteTheme } from '../../../../../theme';
import { linearGradientDef } from '@nivo/core';

const getBarColor = ({ data }) => {
  return siteTheme.flagStates[data.flag].background || '#C0C0C0';
};

export const StintLapChart = ({ showAll, stint }) => {

  const data = showAll ? stint.laps : stint.relevantLaps;

  const laptimes = data.map(l => l.laptime);
  const minValue = Math.min(...laptimes) - 1;

  return (
    <ResponsiveBar
      axisBottom={false}
      axisLeft={{
        format: (v) => dayjs.duration(v * 1000).format('m:ss'),
        tickValues: 5
      }}
      axisTop={true}
      colors={getBarColor}
      data={data}
      defs={[
        linearGradientDef('slow_zone', [
            { offset: 0, color: '#DDDD00' },
            { offset: 50, color: 'black' },
            { offset: 100, color: '#DDDD00' },
        ], {
                gradientTransform: 'rotate(90, 0.5, 0.5)'
            })
      ]}
      indexBy={l => l.lapNumber}
      keys={['laptime']}
      margin={{ top: 30, bottom: 30, left: 50, right: 10 }}
      minValue={minValue}
      theme={chartTheme}
      valueFormat={(v) => dayjs.duration(v * 1000).format('m:ss.SSS')}
    />
  );
};
