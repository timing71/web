import { useCallback, useContext, useEffect, useState } from "react";

import { useServiceManifest } from "../../../components/ServiceContext";
import { useConnectionService } from "../../../ConnectionServiceProvider";
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
  const cs = useConnectionService();
  const { setMessage } = useContext(SystemMessageContext);
  const { hide } = useMenuContext();
  const [enabled, setEnabled] = useState(true);

  useEffect(
    () => {
      const handleMessage = (message) => {
        if (message?.uuid === manifest?.uuid && message.type === 'REPLAY_GENERATION_FINISHED') {
          setMessage(null);
          setEnabled(true);
        }
      };

      cs.on('message', handleMessage);

      return () => {
        cs.removeListener('message', handleMessage);
      };
    },
    [cs, manifest?.uuid, setMessage]
  );

  const startDownload = useCallback(
    () => {
      setEnabled(false);
      cs.send({ type: 'GENERATE_SERVICE_REPLAY', uuid: manifest.uuid }).then(
        () => setMessage(<ReplayGenerationMessage />)
      );
      hide();
    },
    [cs, hide, manifest, setMessage]
  );

  return (
    <ToggleMenuItem
      disabled={!enabled && !!manifest}
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
