import {
  useMenuState,
  Menu as RkMenu,
} from "reakit/Menu";

import { Settings } from '@styled-icons/material';

import styled from "styled-components";

import { stopEventBubble } from '../../../utils';
import { MenuContextProvider } from "./context";
import { MenuButton } from "./MenuButton";


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

export const Menu = ({ children }) => {
  const menuState = useMenuState({ animated: 100, gutter: 6 });

  return (
    <MenuContextProvider value={menuState}>
      <MenuButton {...menuState}>
        <SettingsIcon />
      </MenuButton>
      <RkMenu
        aria-label='Settings'
        tabIndex={0}
        {...menuState}
      >
        <MenuInner
          onDoubleClick={stopEventBubble()}
        >
          {
            children
          }
        </MenuInner>
      </RkMenu>
    </MenuContextProvider>
  );
};
