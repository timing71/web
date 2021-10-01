import styled from "styled-components";
import { timeInSeconds } from "../../../formats";
import { Stat } from "../../../racing";

const formatValue = (value, formatKey) => {

  if (formatKey === 'time') {
    return timeInSeconds(value);
  }
  else if (formatKey === 'delta' && value?.toFixed) {
    if (value >= 60) {
      const mins = Math.floor(value / 60);
      return `${mins}:${(value - (60 * mins)).toFixed(3)}`;
    }
    return value.toFixed(3);
  }

  return value;
};

const CarClassCell = styled.td`
  color: ${ props => (props.value && props.theme.classColours[props.value.toLowerCase()]) || 'white' };
`;

const CellInner = styled.td`
  color: ${ props => (props.value && props.theme.modifiers[props.value]) || 'white' };
`;

const CarStateCell = styled.td`
  color: ${ props => (props.value && props.theme.carStates[props.value].color) || 'white' };
  background: ${ props => (props.value && props.theme.carStates[props.value].background) || 'transparent' };
`;

const CentredCell = styled(CellInner)`
  text-align: center;
`;

const TruncatingCell = styled(CellInner)`
  max-width: 12em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;`;

const CellTypes = {
  [Stat.CLASS]: CarClassCell,
  [Stat.NUM]: CentredCell,
  [Stat.POS_IN_CLASS]: CentredCell,
  [Stat.STATE]: CarStateCell,
  [Stat.DRIVER]: TruncatingCell,
  [Stat.CAR]: TruncatingCell,
  [Stat.TEAM]: TruncatingCell,
  [Stat.LAPS]: CentredCell,
  [Stat.PITS]: CentredCell
};

export const TimingTableCell = ({ stat, value }) => {

  const Cell = CellTypes[stat] || CellInner;

  if (Array.isArray(value)) {
    return (
      <Cell value={value[1]}>
        {formatValue(value[0], stat[1])}
      </Cell>
    );
  }

  return (
    <Cell value={value}>
      {formatValue(value, stat[1])}
    </Cell>
  );
};
