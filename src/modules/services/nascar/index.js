import { useCallback, useContext, useEffect } from "react";
import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";

import { PluginContext } from "../../pluginBridge";
import { getManifest, translate } from "./translate";

const DATA_URL = 'https://cf.nascar.com/live/feeds/live-feed.json';

export const Nascar = () => {

  const port = useContext(PluginContext);

  const { updateManifest } = useServiceManifest();
  const { updateState } = useServiceState();

  const getData = useCallback(
    () => {
      port.fetch(DATA_URL).then(
        message => {
          const jsonData = JSON.parse(message);

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
      const interval = window.setInterval(getData, 5000);

      return () => {
        window.clearInterval(interval);
      };
    },
    [getData]
  );

  return null;
};

Nascar.regex = /.*\.nascar\.com/;
