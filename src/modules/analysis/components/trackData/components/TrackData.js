import styled from "styled-components";
import { useAnalysis } from "../../context";
import { Chart } from "./Chart";
import { observer } from 'mobx-react-lite';

const Grid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: minmax(250px, 30vh);
`;

const COLORS = ['#54ffff', '#ffa600', '#008000', '#a8dc5b', '#54f8cf', '#7cec96', '#d4c523'];

const extendSeries = (series, referenceTimestamp) => {
  const mostRecent = series.data[series.data.length - 1];

  return {
    ...series,
    data: [
      ...series.data,
      { ...mostRecent, timestamp: referenceTimestamp }
    ]
  } ;
};

export const TrackData = observer(() => {

  const analysis = useAnalysis();
  const ts = analysis.referenceTimestamp();

  return (
    <Grid>
      {
        analysis.trackData.toArray.map(
          (s, idx) => (
            <Chart
              color={COLORS[idx % COLORS.length]}
              key={s.label}
              maxTime={ts}
              minTime={analysis.manifest.startTime}
              series={extendSeries(s, ts)}
            />
          )
        )
      }
    </Grid>
  );
});
