import styled from 'styled-components';

export const Controls = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  & div, & h3 {
    flex-grow: 1;
  }

  label {
    margin: 0 0.5em;
  }
`;

export const Control = styled.div`
  display: flex;
  align-items: center;

  .rc-slider-track {
    background-color: ${ props => props.theme.site.highlightColor };
  }

  .rc-slider-rail {
    background-color: #808080;
  }

  .rc-slider-handle {
    border-color: ${ props => props.theme.site.highlightColor };
    background-color: ${ props => props.theme.site.highlightColor };
  }
`;

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
