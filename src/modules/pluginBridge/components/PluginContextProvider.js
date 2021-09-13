/* global chrome */

import { useEffect, useState } from "react";
import { PluginContext } from "../context";

export const PluginContextProvider = ({ extensionID, children }) => {

  const [port, setPort] = useState();

  useEffect(
    () => {
      if (extensionID) {
        const myPort = chrome.runtime.connect(extensionID);

        myPort.onMessage.addListener(
          (message) => {
            if (message.type === 'HANDSHAKE_RETURN') {
              setPort(myPort);
            }
          }
        );

        myPort.postMessage({ type: 'HANDSHAKE' });

        return () => {
          myPort.disconnect();
        };
      }
    },
    [extensionID]
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
