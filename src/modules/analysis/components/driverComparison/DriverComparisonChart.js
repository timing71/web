import { ResponsiveBoxPlot } from '@nivo/boxplot';
import { dayjs, FlagState } from '@timing71/common';
import { observer } from 'mobx-react-lite';
import { useAnalysis } from '../context';
import { theme } from "../../charts";
import { useTheme } from '@nivo/core';
import { useTheme as useStyledTheme } from 'styled-components';
import { readableColor } from 'polished';

// From https://github.com/plouc/nivo/blob/master/packages/boxplot/src/compute/stratification.ts
// to make sure we're consistent with the rendered values
const getQuantile = (values, quantile = 0.5) => {
  const realIndex = (values.length - 1) * Math.max(0, Math.min(1, quantile));
  const intIndex = Math.floor(realIndex);
  if (realIndex === intIndex) return values[intIndex];
  const v1 = values[intIndex],
      v2 = values[intIndex + 1];
  return v1 + (v2 - v1) * (realIndex - intIndex);
};

const generateData = (analysis, classFilter) => {
  const data = [];

  const sortKey = {};
  const raceClasses = {};

  analysis.cars.toArray.forEach(
    car => {
      if (!classFilter || car.classColorString === classFilter) {
        car.drivers.forEach(
          driver => {

            const laptimes = driver.stints.flatMap(
              stint => stint.laps.filter(l => l.flag === FlagState.GREEN).map(l => l.laptime)
            );

            if (laptimes.length >= 10) {
              const ident = `${driver.name} [${car.raceNum}]`;
              laptimes.sort((a, b) => a - b);

              const relevantTimes = laptimes.slice(0, 10);
              sortKey[ident] = getQuantile(relevantTimes);
              raceClasses[ident] = car.classColorString;

              relevantTimes.forEach(
                l => data.push({
                  group: ident,
                  value: l
                })
              );
            }

          }
        );
      }
    }
  );

  return [data, sortKey, raceClasses];
};

const DriverTick = ({ raceClass, tick }) => {
  const theme = useTheme();
  const styledTheme = useStyledTheme();

  const carNumStart = tick.value.indexOf('[');

  const carNum = tick.value.slice(carNumStart + 1, tick.value.indexOf(']'));
  const driverName = tick.value.slice(0, carNumStart);
  const classColour = styledTheme.classColours[raceClass];

  return (
    <g transform={`translate(${tick.x}, ${tick.y})`}>
      <line
        style={theme.axis.ticks.line}
        x1="0"
        x2="-5"
        y1="0"
        y2="0"
      />
      <text
        dominantBaseline="central"
        style={{
          ...theme.axis.ticks.text,
          fill: classColour
        }}
        textAnchor="end"
        transform="translate(-50,0) rotate(0)"
      >
        {driverName}
      </text>
      <rect
        height={32}
        rx={3}
        style={{
          fill: classColour
        }}
        width={32}
        x={-42}
        y={-16}
      />
      <text
        dominantBaseline="central"
        style={{ fill: readableColor(classColour || theme.axis.ticks.text.fill) }}
        textAnchor='middle'
        transform='translate(-26, 0)'
      >
        {carNum}
      </text>
    </g>
  );
};

export const DriverComparisonChart = observer(
  ({ classFilter, width }) => {

    const analysis = useAnalysis();

    const [data, sortKey, raceClasses] = generateData(analysis, classFilter);

    const groups = Object.entries(sortKey).sort((a, b) => b[1] - a[1]);
    const sortedKeys = groups.map(a => a[0]);

    return (
      <ResponsiveBoxPlot
        animate={false}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          renderTick: (tick) => (
            <DriverTick
              raceClass={raceClasses[tick.value]}
              tick={tick}
            />
          )
        }}
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        colors={[ '#008000' ]}
        data={data}
        enableGridX={true}
        enableGridY={false}
        groups={sortedKeys}
        height={50 + (groups.length * 48)}
        layout='horizontal'
        margin={{ top: 20, right: 60, bottom: 60, left: 200 }}
        medianColor='yellow'
        padding={0.15}
        theme={theme}
        valueFormat={(v) => dayjs.duration(Math.floor(v * 1000)).format('m:ss.SSS')}
        whiskerEndSize={1}
        width={width}
      />
    );
  }
);
