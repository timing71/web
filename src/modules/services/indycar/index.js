import { useCallback, useContext, useEffect, useState } from "react";
import { PluginContext } from "../../pluginBridge";
import { translate } from "./translate";

const DATA_URL = 'https://indycarsso.blob.core.windows.net/racecontrol/timingscoring.json';

export const IndyCar = () => {

  const port = useContext(PluginContext);
  const [raceState, setRaceState] = useState();

  const handleMessage = useCallback(
    (message) => {
      if (message.type === 'FETCH_RETURN' && message.originalMessage && message.originalMessage.url === DATA_URL) {
        const data = message.data.replace(/^jsonCallback\(/, '').replace(/\);\r\n$/, '');
        setRaceState(
          translate(
            JSON.parse(data)
          )
        );
      }
    },
    []
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
      {JSON.stringify(raceState, null, 2)}
    </pre>
  );
};

IndyCar.regex = /racecontrol\.indycar\.com/;
