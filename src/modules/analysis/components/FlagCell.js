import styled from "styled-components";
import { Cell } from "./Table";

export const FlagCell = styled(Cell).attrs(
  props => ({
    ...props,
    children: (
      <span>
        {props.flag.replace('_', ' ')}
      </span>
    )
  })
)`

  text-transform: uppercase;

  && {
    background: ${ props => props.theme.flagStates[props.flag]?.background || 'black' };
    color: ${ props => props.theme.flagStates[props.flag]?.color || 'white' };
    animation: ${ props => (!!props.animated && props.theme.flagStates[props.flag]?.animation) || 'none' };
  }

  font-style: normal !important;
`;
