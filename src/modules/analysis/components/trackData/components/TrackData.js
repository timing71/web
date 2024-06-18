import styled from "styled-components";
import { useAnalysis } from "../../context";
import { Chart } from "./Chart";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 33vh;
`;

const COLORS = ['#54ffff', '#ffa600', '#008000', '#a8dc5b', '#54f8cf', '#7cec96', '#d4c523'];

export const TrackData = () => {

  const analysis = useAnalysis();

  return (
    <Grid>
      {
        analysis.trackData.toArray.map(
          (s, idx) => (
            <Chart
              color={COLORS[idx % COLORS.length]}
              key={s.label}
              series={s}
            />
          )
        )
      }
    </Grid>
  );
};
