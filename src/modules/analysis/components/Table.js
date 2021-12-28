import styled from "styled-components";

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

    text-align: left;
    text-transform: uppercase;
  }

`;
