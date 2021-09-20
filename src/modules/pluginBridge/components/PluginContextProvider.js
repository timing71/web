/* global chrome */

import { useCallback, useEffect, useState } from "react";
import { PluginContext } from "../context";

export const PluginContextProvider = ({ extensionID, children }) => {

  const [port, setPort] = useState();

  const openPort = useCallback(
    (extensionID) => {
      const myPort = chrome.runtime.connect(extensionID);

      myPort.onMessage.addListener(
        (message) => {
          if (message.type === 'HANDSHAKE_RETURN') {
            setPort(myPort);
          }
        }
      );

      myPort.postMessage({ type: 'HANDSHAKE' });

      myPort.onDisconnect.addListener(
        () => {
          // console.log('Remote port is disconnected, reconnecting...');
          setPort(openPort(extensionID));
        }
      );

      return myPort;
    },
    []
  );

  useEffect(
    () => {
      if (extensionID) {
        setPort(openPort(extensionID));

        return () => {
          port && port.disconnect();
        };
      }
    },
    [extensionID, openPort] // eslint-disable-line react-hooks/exhaustive-deps
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
