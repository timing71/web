import styled from "styled-components";

export const FlagPanel = styled.div.attrs(
  props => ({
    children: props.text
  })
)`
  position: relative;
  background-color: black;
  color: white;
  grid-area: flag;
  font-family: Verdana, monospace;
  text-align: center;
  padding: 0.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  align-self: stretch;

  z-index: -1;

  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;

    padding: 0.5em;

    background: ${ props => props.theme.flagStates[props.flag]?.background || 'black' };
    animation: ${ props => props.theme.flagStates[props.flag]?.animation || 'none' };
    color: ${ props => (props.theme.flagStates[props.flag]?.color) || 'white' };

    content: "${ props => props.text.replaceAll('"', '\\"')}";
  }
`;
