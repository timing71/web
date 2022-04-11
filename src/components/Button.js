import styled, { css } from "styled-components";

export const Button = styled.button`
  color: ${ props => props.disabled ? 'grey' : props.danger ? 'red' : props.theme.site.highlightColor };
  background-color: transparent;
  border: 1px solid ${ props => props.disabled ? 'grey' : props.danger ? 'red' : props.theme.site.highlightColor };
  font-size: large;

  border-radius: 0.25em;
  padding: 0.5em;

  transition-property: background-color, color;
  transition-duration: 0.25s;

  cursor: ${ props => props.disabled ? 'not-allowed' : 'pointer' };

  ${
    props => !props.disabled && css`
    &:hover {
      background-color: ${ props => props.danger ? 'red' : props.theme.site.highlightColor };
      color: ${ props => props.danger ? 'white' : 'black' };
      cursor: pointer;
    }`
  }

`;
