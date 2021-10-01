import styled from "styled-components";
import { Stat } from "../../../racing";
import { TimingTableCell } from "./TimingTableCell";


const Position = styled.td`
  color: #54FFFF;
  text-align: right;
`;

const TimingTableRowInner = styled.tr`
  background: ${ props => props.carState && (props.theme.carStates[props.carState].rowBackground || ['black'])[0] };
  font-style: ${ props => props.carState && (props.theme.carStates[props.carState].rowStyle || 'normal')};

  &:nth-of-type(odd) {
    background: ${ props => props.carState && (props.theme.carStates[props.carState].rowBackground || [null, 'black'])[1] };
  }
`;

export const TimingTableRow = ({ car, manifest, position, statExtractor }) => (
  <TimingTableRowInner
    carState={statExtractor.get(car, Stat.STATE)}
  >
    <Position>{position}</Position>
    {
      manifest.columnSpec && manifest.columnSpec.map(
        (stat, idx) => (
          <TimingTableCell
            key={idx}
            stat={stat}
            value={car[idx]}
          />
        )
      )
    }
  </TimingTableRowInner>
);
