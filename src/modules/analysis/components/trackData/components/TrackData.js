import styled from "styled-components";
import { useAnalysis } from "../../context";
import { Chart } from "./Chart";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 33vh;
`;

export const TrackData = () => {

  const analysis = useAnalysis();

  return (
    <Grid>
      {
        analysis.trackData.toArray.map(
          s => (
            <Chart
              key={s.label}
              series={s}
            />
          )
        )
      }
    </Grid>
  );
};
