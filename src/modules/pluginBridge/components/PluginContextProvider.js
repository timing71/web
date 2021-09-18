/* global chrome */

import { useEffect, useRef, useState } from "react";
import { PluginContext } from "../context";

export const PluginContextProvider = ({ extensionID, children }) => {

  const [port, setPort] = useState();
  const myPort = useRef(null);

  useEffect(
    () => {
      if (extensionID) {
        myPort.current = chrome.runtime.connect(extensionID);

        myPort.current.onMessage.addListener(
          (message) => {
            if (message.type === 'HANDSHAKE_RETURN') {
              setPort(myPort.current);
            }
          }
        );

        myPort.current.postMessage({ type: 'HANDSHAKE' });

        myPort.current.onDisconnect.addListener(
          () => {
            myPort.current = chrome.runtime.connect(extensionID);
            setPort(myPort.current);
          }
        );

        return () => {
          myPort.current.disconnect();
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
