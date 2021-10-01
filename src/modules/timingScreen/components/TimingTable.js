import styled from "styled-components";
import { StatExtractor } from "../statExtractor";
import { TimingTableHeader } from "./TimingTableHeader";
import { TimingTableRow } from "./TimingTableRow";

const TimingTableWrapper = styled.div`
  grid-area: timing;
  overflow: auto;
`;

const TimingTableInner = styled.table`

  margin: 0;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  width: 100%;
  border-collapse: collapse;

  td, th {
    padding: 0.5em;
    line-height: 1;
    white-space: nowrap;
  }
`;

export const TimingTable = ({ state }) => {

  const statExtractor = new StatExtractor(state.manifest?.columnSpec || []);

  return (
    <TimingTableWrapper>
      <TimingTableInner>
        <TimingTableHeader manifest={state.manifest} />
        <tbody>
          {
            state.cars.map(
              (car, idx) => (
                <TimingTableRow
                  car={car}
                  key={car[0]}
                  manifest={state.manifest}
                  position={idx + 1}
                  statExtractor={statExtractor}
                />
              )
            )
          }
        </tbody>
      </TimingTableInner>
    </TimingTableWrapper>
  );
};
