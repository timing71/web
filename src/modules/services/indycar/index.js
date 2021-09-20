import { useCallback, useContext, useEffect } from "react";

import { PluginContext } from "../../pluginBridge";
import { getManifest, translate } from "./translate";

const DATA_URL = 'https://indycarsso.blob.core.windows.net/racecontrol/timingscoring.json';

export const IndyCar = ({ children, state, updateManifest, updateState }) => {

  const port = useContext(PluginContext);

  const getData = useCallback(
    () => {
      port.fetch(DATA_URL).then(
        message => {
          const data = message.replace(/^jsonCallback\(/, '').replace(/\);\r\n$/, '');
          const jsonData = JSON.parse(data);

          const newManifest = getManifest(jsonData);
          updateManifest(newManifest);
          updateState(translate(jsonData));
        }
      );
    },
    [port, updateManifest, updateState]
  );

  useEffect(
    () => {
      getData();
      const interval = window.setInterval(getData, 10000);

      return () => {
        window.clearInterval(interval);
      };
    },
    [getData]
  );

    if (children) {
      return (
        <>
          {children}
        </>
      );
    }

  return (
    <pre>
      {JSON.stringify(state, null, 2)}
    </pre>
  );
};

IndyCar.regex = /racecontrol\.indycar\.com/;
