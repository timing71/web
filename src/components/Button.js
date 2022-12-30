import styled, { css } from "styled-components";

export const Button = styled.button`
  color: ${ props => props.disabled ? 'grey' : props.danger ? 'red' : props.theme.site.highlightColor };
  background-color: transparent;
  border: 1px solid ${ props => props.disabled ? 'grey' : props.danger ? 'red' : props.theme.site.highlightColor };
  font-family: ${ props => props.theme.site.headingFont };
  font-size: large;

  border-radius: 0.25em;
  padding: 0.5em;

  transition-property: background-color, color;
  transition-duration: 0.25s;

  cursor: ${ props => props.disabled ? 'not-allowed' : 'pointer' };
  user-select: none;

  ${
    props => !props.disabled && css`
    &:hover {
      background-color: ${ props => props.danger ? 'red' : props.theme.site.highlightColor };
      color: ${ props => props.danger ? 'white' : 'black' };
      cursor: pointer;
    }`
  }

  ${
    props => !props.disabled && props.active && css`
      background-color: ${ props => props.danger ? 'red' : props.theme.site.highlightColor };
      color: ${ props => props.danger ? 'white' : 'black' };
    `
  }

`;

export const ButtonGroup = styled.div`

display: flex;
align-items: stretch;

& ${Button} {

  padding: 0.25em;
  min-width: 3em;

  & svg {
    height: 1.5em;
  }

  &:not(:first-child):not(:last-child) {
    border-radius: 0;
  }

  &:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

}

`;
