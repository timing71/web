import styled from "styled-components";
import { Replay } from "./Replay";

const Inner = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(0, 1fr);
  grid-gap: 1em;

`;

export const ReplayList = ({ replays }) => {
  return (
    <Inner>
      {
        replays.map(
          r => (
            <Replay
              key={r.id}
              replay={r}
            />
          )
        )
      }
    </Inner>
  );
};
