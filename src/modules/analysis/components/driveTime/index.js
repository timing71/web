import { observer } from "mobx-react-lite";
import { BarCanvas } from '@nivo/bar';
import { useMeasure } from '@nivo/core';
import styled from 'styled-components';

import { useAnalysis } from "../context";
import dayjs from '../../../../datetime';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChartContainer = styled.div`
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
`;

const WidthResponsiveWrapper = ({ children, height }) => {
  const [measureRef, bounds] = useMeasure();
  const shouldRender = bounds.width > 0;

  return (
    <div
      ref={measureRef}
      style={{ width: '100%', height: '100%' }}
    >
      {shouldRender && children({ width: bounds.width, height })}
    </div>
  );
};

const TooltipWrapper = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  padding: 0.5em;
  font-size: small;
  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-radius: 0.25em;
`;

const Tooltip = ({ data, id, value }) => {
  return (
    <TooltipWrapper>
      <div><b>{data.name}</b></div>
      <div>Stint {id} of {data.stints}: {dayjs.duration(value * 1000).format('HH:mm:ss')}</div>
      <div>Total: {dayjs.duration(data.totalTime * 1000).format('HH:mm:ss')}</div>
    </TooltipWrapper>
  );
};

const theme = {
  textColor: '#54FFFF',
  fontSize: 14,
  fontFamily: 'Play,Verdana'
};

const Totals = (ctx, { bars = [] }) => {
  const finalBars = {};

  bars.forEach(
    bar => {
      const driverIndex = bar.data.index;
      if (!finalBars[driverIndex] || finalBars[driverIndex].data.id < bar.data.id) {
        if (bar.data.value !== null) {
          finalBars[driverIndex] = bar;
        }
      }
    }
  );

  ctx.font = '14px Play, Verdana';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#54FFFF';

  Object.values(finalBars).forEach(
    bar => {
      ctx.fillText(
        dayjs.duration(bar.data.data.totalTime * 1000).format('HH:mm:ss'),
        bar.x + bar.width + 10,
        bar.y + (bar.height / 2),
        130
      );
    }
  );

  // For SVG-based chart:

  // return Object.values(finalBars).map(
  //   bar => (
  //     <svg key={bar.key}>
  //       <g className='totalsLabel'>
  //         <text
  //           dominantBaseline="middle"
  //           style={{
  //             fill: '#54FFFF'
  //           }}
  //           x={bar.x + bar.width + 10}
  //           y={bar.y + (bar.height / 2)}
  //         >
  //           {dayjs.duration(bar.data.data.totalTime * 1000).format('HH:mm:ss')}
  //         </text>
  //       </g>
  //     </svg>
  //   )
  // );
};

export const DriveTime = observer(
  () => {

    const analysis = useAnalysis();
    const drivers = [];

    let mostStints = 0;

    analysis.cars.toArray.forEach(
      car => {
        car.drivers.forEach(
          driver => {

            const d = {
              name: driver.name,
              car: driver.car.raceNum,
              totalTime: 0,
              stints: driver.stints.length
            };

            mostStints = Math.max(mostStints, driver.stints.length);

            driver.stints.forEach(
              (s, idx) => {
                let duration = 0;
                if (s.inProgress) {
                  duration = (analysis.referenceTimestamp() - s.startTime) / 1000;
                }
                else {
                  duration = s.durationSeconds;
                }

                d[idx + 1] = duration;
                d.totalTime += duration;
              }
            );

            drivers.push(d);
          }
        );
      }
    );

    drivers.sort((a, b) => b.totalTime - a.totalTime);

    return (
      <Container>
        <h3>Total drive time per driver</h3>
        <ChartContainer>
          <WidthResponsiveWrapper>
            {
              ({ width }) => (
                <BarCanvas
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Drive time',
                    legendPosition: 'middle',
                    legendOffset: 32
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0
                  }}
                  colors={[ '#00D000', '#008000' ]}
                  data={drivers}
                  enableGridX={false}
                  enableGridY={false}
                  enableLabel={false}
                  height={drivers.length * 48}
                  indexBy={d => `${d.name} (#${d.car})`}
                  keys={[...Array(mostStints + 1).keys()]}
                  layers={['axes', 'bars', Totals, 'markers']}
                  layout='horizontal'
                  margin={{ top: 10, right: 150, bottom: 10, left: 240 }}
                  minValue={0}
                  padding={0.25}
                  theme={theme}
                  tooltip={Tooltip}
                  valueFormat={(v) => dayjs.duration(v * 1000).format('HH:mm:ss')}
                  width={width}
                />
              )
            }
          </WidthResponsiveWrapper>
        </ChartContainer>
        <small>Drive time excludes time in pit lane.</small>
      </Container>
    );
  }
);
