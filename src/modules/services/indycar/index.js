import { useCallback, useContext, useEffect } from "react";
import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";

import { PluginContext } from "../../pluginBridge";
import { getManifest, translate } from "./translate";

const DATA_URL = 'https://indycarsso.blob.core.windows.net/racecontrol/timingscoring.json';

export const IndyCar = () => {

  const port = useContext(PluginContext);

  const { updateManifest } = useServiceManifest();
  const { updateState } = useServiceState();

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
};

IndyCar.regex = /racecontrol\.indycar\.com/;
