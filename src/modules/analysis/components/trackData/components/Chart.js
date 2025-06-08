import { ResponsiveLine } from "@nivo/line";
import { dayjs } from '@timing71/common';
import { theme as chartTheme } from '../../../charts';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MinMax = styled.div`
  display: grid;
  grid-template-columns: repeat(3, auto);
  grid-column-gap: 0.5em;
  & > span.heading {
    font-weight: bold;
    &.heading-max {
      color: #ffa600;
    }
    &.heading-min {
      color: #54f8cf;
    }
  }
`;

const TooltipInner = styled.div`
  background-color: #000000AA;
  padding: 2px;
  color: white;
`;

const formatTime = (t) => dayjs(t).format('HH:mm');

const makeTooltip = (unit) => ({ point }) => {
  return (
    <TooltipInner>
      {point.data.xFormatted}: <b>{point.data.yFormatted}{unit}</b>
    </TooltipInner>
  );
};

export const Chart = observer(
  ({ color='#54FFFF', minTime, maxTime, series }) => {

    const chartData = [{
      id: series.label,
      data: series.data.map(d => ({ x: d.timestamp, y: d.value }))
    }];



    const minValue = chartData[0].data.reduce(
      (prev, next) => {
        if (!prev.value || next.y < prev.value) {
          return { value: next.y, timestamp: next.x };
        }
        return prev;
      },
      { value: null }
    );

    const maxValue = chartData[0].data.reduce(
      (prev, next) => {
        if (!prev.value || next.y > prev.value) {
          return { value: next.y, timestamp: next.x };
        }
        return prev;
      },
      { value: null }
    );

    const minAxisValue = Math.floor(minValue.value / 10) * 10;
    const maxAxisValue = Math.ceil(maxValue.value / 10) * 10;
    const minComesFirst = maxValue.timestamp > minValue.timestamp;

    return (
      <div>
        <Header>
          <h2>
            {series.label} ({series.unit.trim()})
          </h2>
          <MinMax>
            <span className='heading heading-max'>Max:</span>
            <span>{maxValue.value}{series.unit}</span>
            <span>({ dayjs(maxValue.timestamp).format('HH:mm') })</span>
            <span className='heading heading-min'>Min:</span>
            <span>{minValue.value}{series.unit}</span>
            <span>({ dayjs(minValue.timestamp).format('HH:mm') })</span>
          </MinMax>
        </Header>
        <ResponsiveLine
          axisBottom={{
            tickRotation: -60,
            format: formatTime
          }}
          axisLeft={{
            tickCount: 5
          }}
          colors={[ color ]}
          curve='stepAfter'
          data={chartData}
          enablePoints={false}
          margin={{ top: 10, bottom: 90, left: 30, right: 10 }}
          markers={[
            {
              axis: 'x',
              value: maxValue.timestamp,
              lineStyle: { stroke: '#ffa600', strokeWidth: 1 },
              textStyle: { fill: '#ffa600', fontSize: 12 },
              legend: 'Max',
              legendOrientation: 'horizontal',
              legendPosition: minComesFirst ? 'top-right' : 'top-left'
            },
            {
              axis: 'x',
              value: minValue.timestamp,
              lineStyle: { stroke: '#54f8cf', strokeWidth: 1 },
              textStyle: { fill: '#54f8cf', fontSize: 12 },
              legend: 'Min',
              legendOrientation: 'horizontal',
              legendPosition: minComesFirst ? 'top-left' : 'top-right',
            },
          ]}
          theme={chartTheme}
          tooltip={makeTooltip(series.unit.trim())}
          useMesh
          xFormat={formatTime}
          xScale={{
            type: 'time',
            nice: true,
            min: minTime,
            max: maxTime
          }}
          yScale={{
            max: Math.max(maxAxisValue, minAxisValue + 1),
            min: minAxisValue,
            type: 'linear',
            nice: true
          }}
        />
      </div>
    );
  }
);
