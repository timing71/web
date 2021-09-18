import styled from "styled-components";
import { timeInSeconds } from "../../../formats";


const formatValue = (value, formatKey) => {

  if (formatKey === 'time') {
    return timeInSeconds(value);
  }

  return value;
};

const TimingTableCell = ({ stat, value }) => {

  if (Array.isArray(value)) {
    return (
      <td className={value[1]}>
        {formatValue(value[0], stat[1])}
      </td>
    );
  }

  return (
    <td>{formatValue(value, stat[1])}</td>
  );
};

const Position = styled.td`
  color: #54FFFF;
  text-align: right;
`;


export const TimingTableRow = ({ car, manifest, position }) => (
  <tr>
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
  </tr>
);
