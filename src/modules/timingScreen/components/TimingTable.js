import styled from "styled-components";
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
  }

  tbody tr:nth-of-type(odd) {
    background-color: #202020;
  }
`;

export const TimingTable = ({ state }) => {
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
                />
              )
            )
          }
        </tbody>
      </TimingTableInner>
    </TimingTableWrapper>
  );
};
