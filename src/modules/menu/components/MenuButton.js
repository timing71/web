import { lighten } from "polished";
import styled from "styled-components";
import { MenuButton as RkMenuButton } from 'reakit/Menu';

export const MenuButton = styled(RkMenuButton)`
  background-color: transparent;
  padding: 0;
  border: 0;
  margin-left: 0.5em;

  & svg {
    fill: ${ props => props.visible ? lighten(0.2, props.theme.site.highlightColor) : props.theme.site.highlightColor };
    transition: transform 100ms ease-in-out;
    transform: ${ props => props.visible ? 'rotateZ(45deg)' : 'rotateZ(0)'};
  }

  &:focus {
    outline: none;
  }
`;
