import { useCallback, useContext, useEffect } from "react";

import { useServiceManifest } from "../../../components/ServiceContext";
import { PluginContext } from "../../pluginBridge";
import { ToggleMenuItem } from "./MenuItem";
import { SystemMessageContext } from "./SystemMessage";
import { Logo } from "../../../components/Logo";
import { Download } from "styled-icons/material";

const ReplayGenerationMessage = () => (
  <>
    <Logo
      $spin
      size='2em'
    />
    Creating replay file...
  </>
);

export const DownloadReplay = ({ hide }) => {
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
