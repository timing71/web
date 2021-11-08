import styled from "styled-components";

export const Button = styled.button`
  color: ${ props => props.theme.site.highlightColor };
  background-color: transparent;
  border: 1px solid ${ props => props.theme.site.highlightColor };
  font-size: large;

  border-radius: 0.25em;
  padding: 0.5em;

  &:hover {
    background-color: ${ props => props.theme.site.highlightColor };
    color: black;
    cursor: pointer;
  }
`;
