import {
  useMenuState,
  Menu as RkMenu,
  MenuItem,
  MenuButton,
} from "reakit/Menu";

import { Settings } from '@styled-icons/material-sharp';

import styled from "styled-components";
import { lighten } from "polished";

import { useSetting } from '../../settings';

const SettingsIcon = styled(Settings)`
  fill: ${ props => props.theme.site.highlightColor };

  width: 32px;
  height: 32px;

  &:hover {
    fill: ${ props => lighten(0.2, props.theme.site.highlightColor) };
    cursor: pointer;
  }
`;

const MenuInner = styled(RkMenu)`
  border: 1px solid ${ props => props.theme.site.highlightColor };

`;

const MyMenuButton = styled(MenuButton)`
  background-color: transparent;
  padding: 0;
  border: 0;
`;

const MyMenuItem = styled(MenuItem)`
  font-size: medium;
  height: 2em;
  background-color: rgba(32, 32, 32, 0.9);
  color: ${ props => props.theme.site.highlightColor };
  border: 0;
  padding: 0.25em;

  min-width: 15vw;

  &:hover {
    background-color: ${ props => props.theme.site.highlightColor };
    color: black;
  }
`;


export const Menu = () => {
  const menuState = useMenuState();

  const [ delay, setDelay ] = useSetting('delay');

  return (
    <>
      <MyMenuButton {...menuState}>
        <SettingsIcon />
      </MyMenuButton>
      <MenuInner
        tabIndex={0}
        {...menuState}
      >
        <MyMenuItem>
          Delay:
          <input
            min={0}
            onChange={e => setDelay(e.target.valueAsNumber)}
            type='number'
            value={delay}
          />
        </MyMenuItem>
      </MenuInner>
    </>
  );
};
