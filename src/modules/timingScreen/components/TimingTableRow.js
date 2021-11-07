import styled, { css, keyframes } from "styled-components";
import { Stat } from "../../../racing";
import { TimingTableCell } from "./TimingTableCell";

const blink = keyframes`
  50% { opacity: 0.1; }
`;

const Position = styled.td`
  color: #54FFFF;
  text-align: right;
`;

const TimingTableRowInner = styled.tr`
  background: ${ props => props.theme.settings.backgrounds && props.carState && (props.theme.carStates[props.carState]?.rowBackground || ['black'])[0] };
  font-style: ${ props => props.carState && (props.theme.carStates[props.carState]?.rowStyle || 'normal')};

  &:nth-of-type(odd) {
    background: ${ props => (props.theme.settings.backgrounds && props.carState && (props.theme.carStates[props.carState]?.rowBackground || [null, '#202020'])[1]) || '#202020' };
  }

  ${
    props => (props.carState && props.theme.carStates[props.carState]?.rowColor) && `
    & td {
      color: ${props.theme.carStates[props.carState].rowColor};
    }`
  }

  ${
    props => props.highlight && css`
      animation: ${blink} 0.5s alternate 2;
    `
  }
`;

export const TimingTableRow = ({ car, highlight, manifest, position, statExtractor }) => (
  <TimingTableRowInner
    carState={statExtractor.get(car, Stat.STATE)}
    highlight={highlight}
  >
    <Position>{position}</Position>
    {
      manifest.colSpec && manifest.colSpec.map(
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
