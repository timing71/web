import { useCallback, useContext } from "react";
import {
  useMenuState,
  Menu as RkMenu,
  MenuButton,
  MenuSeparator
} from "reakit/Menu";

import { Check, FormatColorFill, Fullscreen, Highlight, Settings, StackedBarChart } from '@styled-icons/material';

import styled from "styled-components";
import { lighten } from "polished";

import { useSetting } from '../../settings';
import { PluginContext } from "../../pluginBridge";
import { useFullscreenContext } from "../../../components/FullscreenContext";

import { ToggleMenuItem } from "./MenuItem";
import { DelaySetting } from "./DelaySetting";
import { DownloadReplay } from "./DownloadReplay";


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

export const Menu = ({ serviceUUID }) => {
  const menuState = useMenuState({ animated: 100, gutter: 6 });
  const port = useContext(PluginContext);

  const fsHandle = useFullscreenContext();

  const openAnalysis = useCallback(
    () => {
      port.send({ type: 'SHOW_T71_PAGE', page: `analysis/${serviceUUID}` });
      menuState.hide();
    },
    [menuState, port, serviceUUID]
  );

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
          <DelaySetting />
          <MenuSeparator />
          <ToggleMenuItem onClick={openAnalysis}>
            <span>
              <StackedBarChart size={24} />
            </span>
            <label>Launch analysis</label>
          </ToggleMenuItem>
          <MenuSeparator />
          <ToggleMenuItem onClick={fsHandle.toggle}>
            <span>
              <Fullscreen size={24} />
            </span>
            <label>View full screen</label>
            <span>
              { !!fsHandle.active && <Check size={24} /> }
            </span>
          </ToggleMenuItem>
          <ToggleSetting
            icon={<FormatColorFill size={24} />}
            label='Use row background colours'
            name='backgrounds'
          />
          <ToggleSetting
            icon={<Highlight size={24} />}
            label='Use row flashing animations'
            name='animation'
          />
          <MenuSeparator />
          <DownloadReplay hide={menuState.hide} />
        </MenuInner>
      </RkMenu>
    </>
  );
};
