import styled, { css } from 'styled-components';

const DriverNameInner = styled.span`

${
  props => props.theme.driverRanks[props.$rank?.replace('driver-', '')] && css`
    &::before {
      color: ${props.theme.driverRanks[props.$rank?.replace('driver-', '')]};
      content: '●';
      margin-right: 4px;
      font-style: normal;
      vertical-align: text-top;
    }
  `
}

`;

export const DriverName = ({ name, rank }) => (
  <DriverNameInner $rank={rank}>
    {name}
  </DriverNameInner>
);
