import { useCallback, useEffect, useState } from "react";

import { Severity } from "@timing71/common";
import { Download } from "styled-icons/material";

import { useServiceManifest } from "../../../components/ServiceContext";
import { useConnectionService } from "../../../ConnectionServiceProvider";
import { useSystemMessagesContext } from "../../systemMessages";
import { ToggleMenuItem } from "./MenuItem";
import { useMenuContext } from "./context";

const ReplayGenerationMessage = {
  severity: Severity.INFO,
  message: 'Creating replay file...'
};

export const DownloadReplay = () => {
  const { manifest } = useServiceManifest();
  const cs = useConnectionService();
  const { addMessage, removeMessage } = useSystemMessagesContext();
  const { hide } = useMenuContext();
  const [enabled, setEnabled] = useState(true);

  useEffect(
    () => {
      const handleMessage = (message) => {
        if (message?.uuid === manifest?.uuid && message.type === 'REPLAY_GENERATION_FINISHED') {
          removeMessage(ReplayGenerationMessage.uuid);
          setEnabled(true);
        }
      };

      cs.on('message', handleMessage);

      return () => {
        cs.removeListener('message', handleMessage);
      };
    },
    [cs, manifest?.uuid, removeMessage]
  );

  const startDownload = useCallback(
    () => {
      setEnabled(false);
      cs.send({ type: 'GENERATE_SERVICE_REPLAY', uuid: manifest.uuid }).then(
        () => addMessage(ReplayGenerationMessage)
      );
      hide();
    },
    [addMessage, cs, hide, manifest]
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
