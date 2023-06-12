import { ResponsiveBoxPlot } from '@nivo/boxplot';
import { dayjs, FlagState } from '@timing71/common';
import { observer } from 'mobx-react-lite';
import { useAnalysis } from '../context';
import { theme } from "../../charts";

const generateData = (analysis, classFilter) => {
  const data = [];

  const sortKey = {};

  analysis.cars.toArray.forEach(
    car => {
      if (!classFilter || car.classColorString === classFilter) {
        car.drivers.forEach(
          driver => {

            const laptimes = driver.stints.flatMap(
              stint => stint.laps.filter(l => l.flag === FlagState.GREEN).map(l => l.laptime)
            );

            if (laptimes.length >= 10) {
              const ident = `${driver.name} [${driver.car.raceNum}]`;
              laptimes.sort();

              const relevantTimes = laptimes.slice(0, 10);

              sortKey[ident] = relevantTimes[Math.floor(relevantTimes.length / 2)];

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

  return [data, sortKey];
};

export const DriverComparisonChart = observer(
  ({ classFilter, width }) => {

    const analysis = useAnalysis();

    const [data, sortKey] = generateData(analysis, classFilter);

    const groups = Object.entries(sortKey).sort((a, b) => b[1] - a[1]);
    const sortedKeys = groups.map(a => a[0]);

    return (
      <ResponsiveBoxPlot
        animate={false}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0
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
