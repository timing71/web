import { Stat, timeInSeconds } from '@timing71/common';
import styled from "styled-components";

const formatValue = (value, formatKey, manifest) => {

  if (formatKey === 'time') {
    return timeInSeconds(value, manifest.sectorTimePrecision || 3);
  }
  else if (formatKey === 'laptime') {
    return timeInSeconds(value, manifest.timePrecision || 3);
  }
  else if (formatKey === 'delta') {
    return timeInSeconds(value, manifest.intervalPrecision || 3);
  }

  return value;
};

const CellInner = styled.td`
  color: ${ props => (props.$value && props.theme.modifiers[props.$value]) || 'white' };
`;

const CarStateCell = styled.td`
  color: ${ props => (props.$value && props.theme.carStates[props.$value]?.color) || 'white' };
  background: ${ props => (props.$value && props.theme.carStates[props.$value]?.background) || 'transparent' };
`;

const CentredCell = styled(CellInner)`
  text-align: center;
`;

const TruncatingCell = styled(CellInner)`
  max-width: 12em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CarClassCell = styled(CentredCell)`
  color: ${ props => (props.$value && props.theme.classColours[String(props.$value).toLowerCase().replace(/[-/ ]/, '')]) || 'white' };
`;

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

export const TimingTableCell = ({ manifest, stat, value }) => {

  const Cell = CellTypes[stat] || CellInner;

  if (Array.isArray(value)) {
    return (
      <Cell $value={value[1]}>
        {formatValue(value[0], stat[1], manifest)}
      </Cell>
    );
  }

  return (
    <Cell $value={value}>
      {formatValue(value, stat[1], manifest)}
    </Cell>
  );
};
