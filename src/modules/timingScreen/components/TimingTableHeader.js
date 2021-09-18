import styled from "styled-components";

const Header = styled.th`
  text-transform: uppercase;
  text-align: left;
  color: #54FFFF;
  font-weight: normal;

  border-bottom: 2px solid #54FFFF;
`;

export const TimingTableHeader = ({ manifest }) => (
  <thead>
    <tr>
      <Header>Pos</Header>
      {
        manifest.columnSpec && manifest.columnSpec.map(
          (stat, idx) => (
            <Header key={idx}>{stat[0]}</Header>
          )
        )
      }
    </tr>
  </thead>
);
