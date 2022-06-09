import styled from "styled-components";

export const FlagRect = styled.rect`
  fill: ${ props => props.theme.flagStates[props.flag]?.fill || props.theme.flagStates[props.flag]?.background || 'black' };
`;
