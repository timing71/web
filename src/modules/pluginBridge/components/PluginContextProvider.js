import { useCallback, useEffect, useState } from "react";
import { WebConnectionService } from "../connectionService";
import { ConnectionServiceProvider } from "../../../ConnectionServiceProvider";

export const PluginContextProvider = ({ extensionID, children }) => {

  const [connectionService, setConnectionService] = useState();

  const assignConnectionService = useCallback(
    () => {
      const hostIframe = document.querySelector('#t71-host-frame');
      if (hostIframe) {
        setConnectionService(
          new WebConnectionService(extensionID, hostIframe.contentWindow)
        );
      }
      else {
        window.setTimeout(
          assignConnectionService,
          1000
        );
      }
    },
    [extensionID]
  );

  useEffect(
    () => {
      if (!connectionService) {
        assignConnectionService();
      }
    },
    [assignConnectionService, connectionService]
  );

  if (!connectionService) {
    return (
      <p>Connecting to plugin...</p>
    );
  }

  return (
    <ConnectionServiceProvider connectionService={connectionService}>
      { children }
    </ConnectionServiceProvider>
  );
};
