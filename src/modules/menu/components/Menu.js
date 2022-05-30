import {
  useMenuState,
  Menu as RkMenu,
  MenuButton,
} from "reakit/Menu";

import { Settings } from '@styled-icons/material';

import styled from "styled-components";
import { lighten } from "polished";


const SettingsIcon = styled(Settings)`
  fill: ${ props => props.theme.site.highlightColor };

  width: 32px;
  height: 32px;

  &:hover {
    cursor: pointer;
    fill: white;
  }
`;

const MenuInner = styled.div`
  border: 1px solid ${ props => props.theme.site.highlightColor };
  padding: 0.5em;
  background-color: rgba(32, 32, 32, 0.95);
  border-radius: 0.25em;

  & hr {
    border: 1px outset ${ props => props.theme.site.highlightColor };
  }

  &:focus-visible {
    outline: none;
  }

  transition: opacity 100ms ease-in-out, transform 100ms ease-in-out;
  opacity: 0;
  transform-origin: bottom right;
  transform: scale(0, 0);
  [data-enter] & {
    opacity: 1;
    transform: scale(1, 1);
  }

`;

const MyMenuButton = styled(MenuButton)`
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

export const Menu = ({ children, serviceUUID }) => {
  const menuState = useMenuState({ animated: 100, gutter: 6 });


  return (
    <>
      <MyMenuButton {...menuState}>
        <SettingsIcon />
      </MyMenuButton>
      <RkMenu
        aria-label='Settings'
        tabIndex={0}
        {...menuState}
      >
        <MenuInner>
          {
            children
          }
        </MenuInner>
      </RkMenu>
    </>
  );
};
