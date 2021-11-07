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
  margin-left: 0.5em;
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
  const menuState = useMenuState();

  return (
    <>
      <MyMenuButton {...menuState}>
        <SettingsIcon />
      </MyMenuButton>
      <MenuInner
        aria-label='Settings'
        tabIndex={0}
        {...menuState}
      >
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
    </>
  );
};
