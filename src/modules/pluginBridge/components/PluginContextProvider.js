import { useCallback, useEffect, useState } from "react";
import { PluginContext } from "../context";
import { Port } from "../port";

export const PluginContextProvider = ({ extensionID, children }) => {

  const [port, setPort] = useState();

  const assignPort = useCallback(
    () => {
      const hostIframe = document.querySelector('#t71-host-frame');
      if (hostIframe) {
        setPort(new Port(extensionID, hostIframe.contentWindow));
      }
      else {
        window.setTimeout(
          assignPort,
          1000
        );
      }
    },
    [extensionID]
  );

  useEffect(
    () => {
      if (!port) {
        assignPort();
      }
    },
    [assignPort, port]
  );

  if (!port) {
    return (
      <p>Connecting to plugin...</p>
    );
  }

  return (
    <PluginContext.Provider value={port}>
      { children }
    </PluginContext.Provider>
  );
};
