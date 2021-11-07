import styled from "styled-components";

const Header = styled.th`
  font-family: Play, sans-serif;
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
        manifest.colSpec && manifest.colSpec.map(
          (stat, idx) => (
            <Header key={idx}>{stat[0]}</Header>
          )
        )
      }
    </tr>
  </thead>
);
