import {
  useMenuState,
  Menu as RkMenu,
  MenuItem,
  MenuButton,
} from "reakit/Menu";

import { Check, FormatColorFill, Settings } from '@styled-icons/material-sharp';

import styled from "styled-components";
import { lighten } from "polished";

import { useSetting } from '../../settings';
import { Spinner } from "../../../components/Spinner";
import { useCallback } from "react";

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
  padding: 0.5em;
  background-color: rgba(32, 32, 32, 0.9);
  border-radius: 0.25em;

`;

const MyMenuButton = styled(MenuButton)`
  background-color: transparent;
  padding: 0;
  border: 0;
`;

const MyMenuItem = styled(MenuItem).attrs({ as: 'div' })`
  font-size: medium;
  min-height: 2em;
  color: ${ props => props.theme.site.highlightColor };
  border: 0;
  padding: 0.25em;

  min-width: 15vw;
`;

const DelaySetting = () => {
  const [ delay, setDelay ] = useSetting('delay');
  return (
    <MyMenuItem>
      Delay (seconds):
      <Spinner
        min={0}
        onChange={e => setDelay(e)}
        value={delay}
      />
    </MyMenuItem>
  );
};

const ToggleMenuItem = styled(MyMenuItem)`
  display: flex;
  align-items: center;

  &:hover {
    background-color: ${ props => props.theme.site.highlightColor };
    color: black;
  }

  & span {
    width: 24px;
  }

  & label {
    flex-grow: 1;
    margin: 0 1em;
  }
`;

const ToggleSetting = ({ icon, label, name }) => {
  const [setting, setSetting] = useSetting(name);
  const toggle = useCallback(
    () => {
      setSetting(!setting);
    },
    [setSetting, setting]
  );

  return (
    <ToggleMenuItem
      onClick={toggle}
    >
      <span>
        { icon }
      </span>
      <label>{label}</label>
      <span>
        { !!setting && <Check size={24} /> }
      </span>
    </ToggleMenuItem>
  );

};


export const Menu = () => {
  const menuState = useMenuState();

  return (
    <>
      <MyMenuButton {...menuState}>
        <SettingsIcon />
      </MyMenuButton>
      <MenuInner
        tabIndex={0}
        {...menuState}
      >
        <DelaySetting />
        <ToggleSetting
          icon={<FormatColorFill size={24} />}
          label='Use row background colours'
          name='backgrounds'
        />
      </MenuInner>
    </>
  );
};
