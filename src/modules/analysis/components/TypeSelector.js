import styled from 'styled-components';

export const TypeSelector = styled.select`
  font-family: ${ props => props.theme.site.textFont };

  background-color: black;
  color: white;

  padding: 0.5em;

  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-radius: 0.25em;

  &:focus-visible {
    outline: none;
  }
`;
