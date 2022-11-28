import { ResponsiveBar } from "@nivo/bar";
import { dayjs } from '@timing71/common';
import { observer } from "mobx-react-lite";

import { useAnalysis } from "../context";
import { theme as chartTheme } from '../../charts';
import styled from "styled-components";

const Wrapper = styled.div`

  height: 250px;
  width: 100%;

`;

export const PitTimeChart = observer(
  ({ raceNum }) => {

    const analysis = useAnalysis();
    const pitStops = analysis.cars.get(raceNum)?.pitStops || [];
    const referenceTimestamp = analysis.referenceTimestamp();

    const durations = pitStops.map(
      (s, idx) => ({
        duration: s.durationSeconds ? s.durationSeconds * 1000 : (referenceTimestamp - s.startTime),
        id: idx + 1
      })
    );

    return (
      <Wrapper>
        <ResponsiveBar
          axisBottom={true}
          axisLeft={{
            format: (v) => dayjs.duration(v).format('m:ss'),
            tickValues: 5
          }}
          axisTop={false}
          colors={[ 'green' ]}
          data={durations}
          enableLabel={true}
          gridYValues={5}
          isInteractive={false}
          keys={['duration']}
          margin={{ top: 30, bottom: 30, left: 50, right: 10 }}
          theme={chartTheme}
          valueFormat={(v) => dayjs.duration(Math.floor(v)).format('m:ss')}
        />
      </Wrapper>
    );

  }
);
