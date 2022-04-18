import styled from "styled-components";

export const FlagPanel = styled.div`
  grid-area: flag;
  font-family: Verdana, monospace;
  text-align: center;
  padding: 0.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  align-self: stretch;

  background: ${ props => props.theme.flagStates[props.flag]?.background || 'black' };
  color: ${ props => props.theme.flagStates[props.flag]?.color || 'white' };
  animation: ${ props => props.theme.flagStates[props.flag]?.animation || 'none' };

  transform: rotateZ(360deg);
  will-change: color, background-color;
`;
