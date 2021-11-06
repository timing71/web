import styled from "styled-components";

const Inner = styled.div`
  grid-area: data;

  border-top: 2px solid ${ props => props.theme.site.highlightColor };

  padding-bottom: 2.5em;

  overflow-y: auto;
`;

export const DataPanel = () => {

  return (
    <Inner>
    </Inner>
  );
};
