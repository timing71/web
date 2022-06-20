import { useCallback, useContext, useEffect, useState } from "react";

import { useServiceManifest } from "../../../components/ServiceContext";
import { PluginContext } from "../../pluginBridge";
import { ToggleMenuItem } from "./MenuItem";
import { SystemMessageContext } from "./SystemMessage";
import { Logo } from "../../../components/Logo";
import { Download } from "styled-icons/material";
import { useMenuContext } from "./context";

const ReplayGenerationMessage = () => (
  <>
    <Logo
      $spin
      size='2em'
    />
    Creating replay file...
  </>
);

export const DownloadReplay = () => {
  const { manifest } = useServiceManifest();
  const port = useContext(PluginContext);
  const { setMessage } = useContext(SystemMessageContext);
  const { hide } = useMenuContext();
  const [enabled, setEnabled] = useState(true);

  useEffect(
    () => {
      const handleMessage = (message) => {
        if (message?.uuid === manifest.uuid && message.type === 'REPLAY_GENERATION_FINISHED') {
          setMessage(null);
          setEnabled(true);
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
      setEnabled(false);
      port.send({ type: 'GENERATE_SERVICE_REPLAY', uuid: manifest.uuid }).then(
        () => setMessage(<ReplayGenerationMessage />)
      );
      hide();
    },
    [hide, manifest, port, setMessage]
  );

  return (
    <ToggleMenuItem
      disabled={!enabled}
      onClick={() => enabled && startDownload()}
    >
      <span>
        <Download size={24} />
      </span>
      <label>
        Download replay...
      </label>
    </ToggleMenuItem>
  );
};
