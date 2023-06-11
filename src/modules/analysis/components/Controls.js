import styled from 'styled-components';

export const Controls = styled.div`
  display: flex;
  justify-content: space-evenly;

  & > div, & > h3 {
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
