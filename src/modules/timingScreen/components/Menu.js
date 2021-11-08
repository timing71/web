import {
  useMenuState,
  Menu as RkMenu,
  MenuItem,
  MenuButton,
  MenuSeparator
} from "reakit/Menu";

import { Check, Download, FormatColorFill, Highlight, Settings } from '@styled-icons/material';

import styled, { keyframes } from "styled-components";
import { lighten } from "polished";

import { useSetting } from '../../settings';
import { Spinner } from "../../../components/Spinner";
import { useCallback, useContext, useEffect } from "react";
import { useServiceManifest } from "../../../components/ServiceContext";
import { PluginContext } from "../../pluginBridge";
import { SystemMessageContext } from "./SystemMessage";
import logoNoText from '../../../img/logo_no_text.svg';

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

const spin = keyframes`
  100% {
      transform: rotate(360deg);
    }
`;

const SpinnyLogo = styled.img.attrs({ alt: '', src: logoNoText })`
    animation: ${spin} 2s linear infinite;
    margin-right: 0.25em;
`;

const ReplayGenerationMessage = () => (
  <>
    <SpinnyLogo />
    Creating replay file...
  </>
);

const DownloadReplay = ({ hide }) => {
  const { manifest } = useServiceManifest();
  const port = useContext(PluginContext);
  const { setMessage } = useContext(SystemMessageContext);

  useEffect(
    () => {
      const handleMessage = (message) => {
        if (message?.uuid === manifest.uuid && message.type === 'REPLAY_GENERATION_FINISHED') {
          setMessage(null);
        }
      };

      port.on('message', handleMessage);

      return () => {
        port.removeListener('message', handleMessage);
      };
    },
    [manifest.uuid, port, setMessage]
  );

  const startDownload = useCallback(
    () => {
      port.send({ type: 'GENERATE_SERVICE_REPLAY', uuid: manifest.uuid }).then(
        () => setMessage(<ReplayGenerationMessage />)
      );
      hide();
    },
    [hide, manifest, port, setMessage]
  );

  return (
    <ToggleMenuItem onClick={startDownload}>
      <span>
        <Download size={24} />
      </span>
      <label>
        Download replay...
      </label>
    </ToggleMenuItem>
  );
};


export const Menu = () => {
  const menuState = useMenuState({ animated: 100 });

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
