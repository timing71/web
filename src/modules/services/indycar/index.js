import { useCallback, useContext, useEffect } from "react";

import { PluginContext } from "../../pluginBridge";
import { getManifest, translate } from "./translate";

const DATA_URL = 'https://indycarsso.blob.core.windows.net/racecontrol/timingscoring.json';

export const IndyCar = ({ state, updateManifest, updateState }) => {

  const port = useContext(PluginContext);

  const handleMessage = useCallback(
    (message) => {
      if (message.type === 'FETCH_RETURN' && message.originalMessage && message.originalMessage.url === DATA_URL) {
        const data = message.data.replace(/^jsonCallback\(/, '').replace(/\);\r\n$/, '');
        const jsonData = JSON.parse(data);

        const newManifest = getManifest(jsonData);
        updateManifest(newManifest);
        updateState(translate(jsonData));
      }
    },
    [updateManifest, updateState]
  );

  useEffect(
    () => {
      port.onMessage.addListener(handleMessage);
      return () => {
        port.onMessage.removeListener(handleMessage);
      };
    },
    [handleMessage, port]
  );

  useEffect(
    () => {
      port.postMessage({
        type: 'FETCH',
        url: DATA_URL
      });
      const interval = window.setInterval(
        () => port.postMessage({
          type: 'FETCH',
          url: DATA_URL
        }),
        10000
      );

      return () => {
        window.clearInterval(interval);
      };
    },
    [port]
  );

  return (
    <pre>
      {JSON.stringify(state, null, 2)}
    </pre>
  );
};

IndyCar.regex = /racecontrol\.indycar\.com/;
