import styled from "styled-components";
import { useSetting } from "../../settings";

const HeaderRow = styled.tr`
  background-color: black;
  position: sticky;
  top: 0;
`;

const Header = styled.th`
  font-family: Play, sans-serif;
  text-transform: uppercase;
  text-align: left;
  color: #54FFFF;
  font-weight: normal;

  border-bottom: 2px solid #54FFFF;
`;

export const TimingTableHeader = ({ manifest }) => {
  const [hiddenCols] = useSetting('columns.hidden', []);
  return (
    <thead>
      <HeaderRow>
        <Header>Pos</Header>
        {
          manifest.colSpec && manifest.colSpec.filter(
            stat => !hiddenCols.includes(stat[0])
          ).map(
            (stat, idx) => (
              <Header key={idx}>{stat[0]}</Header>
            )
          )
        }
      </HeaderRow>
    </thead>
  );
};
