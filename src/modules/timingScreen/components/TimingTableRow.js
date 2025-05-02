import styled, { css, keyframes } from "styled-components";
import { Stat } from '@timing71/common';

import { TimingTableCell } from "./TimingTableCell";
import { useFocusedCarContext } from '../context';

const blink = keyframes`
  50% { opacity: 0.1; }
`;

const Position = styled.td`
  color: ${ props => props.theme.site.highlightColor };
  text-align: right;
  user-select: none;
`;

const TimingTableRowInner = styled.tr`
  background: ${ props => props.theme.settings?.backgrounds && props.carState && (props.theme.carStates[props.carState]?.rowBackground || ['black'])[0] };
  font-style: ${ props => props.carState && (props.theme.carStates[props.carState]?.rowStyle || 'normal')};

  &:nth-of-type(odd) {
    background: ${ props => (props.theme.settings?.backgrounds && props.carState && (props.theme.carStates[props.carState]?.rowBackground || [null, '#202020'])[1]) || '#202020' };
  }

  ${
    props => (props.carState && props.theme.carStates[props.carState]?.rowColor) && `
    & td {
      color: ${props.theme.carStates[props.carState].rowColor};
    }`
  }

  ${
    props => (props.theme.settings?.backgrounds && props.llState && props.llState[1] === 'sb-new') && css`
      background-color: ${ props.theme.modifiers['sb-new'] } !important;
      & td {
        color: black;
      }

      & td[value='FIN'] {
        color: transparent;
      }
    `
  }

  ${
    props => props.highlight && css`
      animation: ${blink} 0.5s alternate ease-in-out 2;
    `
  }

  ${
    props => props.$focused && css`
      animation: ${blink} 0.25s alternate ease-in-out 4;

      & > td:first-child {
        background-color: ${props => props.theme.site.highlightColor};
        color: black;
        cursor: pointer;
      }
    `
  }

`;

export const TimingTableRow = ({ car, hiddenCols, highlight, manifest, position, statExtractor }) => {
  const carNum = statExtractor.get(car, Stat.NUM);
  const { focusedCarNum, setFocusedCarNum } = useFocusedCarContext();
  const focused = carNum === focusedCarNum;
  return (
    <TimingTableRowInner
      $focused={focused}
      carState={statExtractor.get(car, Stat.STATE)}
      data-car-number={statExtractor.get(car, Stat.NUM)}
      highlight={highlight}
      llState={statExtractor.get(car, Stat.LAST_LAP)}
    >
      <Position onClick={() => setFocusedCarNum(null)}>
        {position}
      </Position>
      {
        manifest.colSpec && manifest.colSpec.filter(
          stat => !hiddenCols.includes(stat[0])
        ).map(
          (stat, idx) => (
            <TimingTableCell
              key={idx}
              manifest={manifest}
              stat={stat}
              value={statExtractor.get(car, stat)}
            />
          )
        )
      }
    </TimingTableRowInner>
  );
};
