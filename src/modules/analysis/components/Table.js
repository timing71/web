import styled, { css } from "styled-components";

export const Table = styled.table`

  border-collapse: collapse;

  width: 100%;

  thead > tr:last-child {
    td, th {
      border-bottom: 1px solid ${ props => props.theme.site.highlightColor };
    }
  }

  td, th {
    padding: 0.5em;
  }

  th {
    color: ${ props => props.theme.site.highlightColor };

    font-family: ${ props => props.theme.site.headingFont };
    font-weight: normal;

    text-transform: uppercase;
  }

`;

export const Heading = styled.th`
  text-align: ${ props => !!props.right ? 'right' : 'left' };
`;

export const Cell = styled.td`
  text-align: ${ props => !!props.right ? 'right' : 'left' };
`;

export const Row = styled.tr`

  ${
    props => !!props.inProgress && css`

    & ${Cell} {
      color: ${ props => props.inProgress ? '#C0C0C0' : 'white' };
      font-style: ${ props => props.inProgress ? 'italic' : 'normal' };
    }

    `
  }

`;