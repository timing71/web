import { useMemo } from 'react';
import { dayjs, FlagState } from '@timing71/common';
import { ResponsiveBar, ResponsiveBarCanvas } from "@nivo/bar";
import { linearGradientDef } from '@nivo/core';
import styled from "styled-components";

import { theme as chartTheme } from '../charts';
import { Theme as siteTheme } from '../../../theme';

const getBarColor = ({ data }) => {
  return siteTheme.flagStates[data.flag]?.background || '#C0C0C0';
};

const TooltipWrapper = styled.div`

  background-color: rgba(0, 0, 0, 0.7);

  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-radius: 0.25em;

  padding: 0.5em;

  h3 {
    margin: 0 0 0.25em 0;
    color: ${ props => props.theme.site.highlightColor };
  }

`;

const Laptime = styled.div`
  text-align: center;
  font-weight: bold;
  margin-bottom: 0.25em;
  color: ${ props => props.flag === FlagState.GREEN ? 'white' : getBarColor({ data: { flag: props.flag } }) };
`;

const Tooltip = ({ data: lap, value }) => {

  return (
    <TooltipWrapper>
      <h3>
        Lap {lap.lapNumber}
      </h3>
      <Laptime flag={lap.flag}>
        { dayjs.duration(value * 1000).format('m:ss.SSS') }
      </Laptime>
      <small>
        ToD { dayjs(lap.timestamp).format('HH:mm:ss') } - { lap.flag.replaceAll('_', ' ').toUpperCase() }
      </small>
    </TooltipWrapper>
  );

};

export const LaptimeChart = ({ canvas, scaleYellow, laps, ...otherProps }) => {

  const Bar = canvas ? ResponsiveBarCanvas : ResponsiveBar;

  const laptimes = laps.map(l => l.laptime);

  const minValue = Math.min(...laptimes) - 1;
  let maxValue = 'auto';

  if (scaleYellow) {
    maxValue = Math.max(...laptimes) + 1;
  }
  else {
    maxValue = Math.max(...laps.filter(l => l.flag === FlagState.GREEN).map(l => l.laptime)) + 1;
  }

  const dedupedLaps = useMemo(
    () => {
      const ddl = [];
      const seen = {};

      laps.forEach(
        l => {
          if (!seen[l.lapNumber]) {
            ddl.push(l);
            seen[l.lapNumber] = true;
          }
        }
      );
      return ddl;
    },
    [laps]
  );

  return (
    <Bar
      axisBottom={false}
      axisLeft={{
        format: (v) => dayjs.duration(v * 1000).format('m:ss'),
        tickValues: 5
      }}
      axisTop={true}
      colors={getBarColor}
      data={dedupedLaps}
      defs={[
        linearGradientDef('slow_zone', [
            { offset: 0, color: '#DDDD00' },
            { offset: 50, color: 'black' },
            { offset: 100, color: '#DDDD00' },
        ], {
                gradientTransform: 'rotate(90, 0.5, 0.5)'
            })
      ]}
      enableLabel={false}
      gridYValues={5}
      indexBy={l => l.lapNumber}
      keys={['laptime']}
      margin={{ top: 30, bottom: 30, left: 50, right: 10 }}
      maxValue={maxValue}
      minValue={minValue}
      theme={chartTheme}
      tooltip={Tooltip}
      valueFormat={(v) => dayjs.duration(Math.floor(v * 1000)).format('m:ss.SSS')}
      {...otherProps}
    />
  );
};
