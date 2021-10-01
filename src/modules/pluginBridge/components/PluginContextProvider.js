/* global chrome */

import { useCallback, useEffect, useRef, useState } from "react";
import { PluginContext } from "../context";
import { Port } from "../port";

export const PluginContextProvider = ({ extensionID, children }) => {

  const port = useRef(new Port());
  const [active, setActive] = useState(false);

  const openPort = useCallback(
    (extensionID) => {
      const myPort = chrome.runtime.connect(extensionID);
      port.current.wrap(myPort);

      // myPort.onMessage.addListener(console.log);

      port.current.send({ type: 'HANDSHAKE' }).then(
        reply => {
          if (reply.type === 'HANDSHAKE_RETURN') {
            setActive(true);
          }
        }
      );

      myPort.onDisconnect.addListener(
        () => {
          // console.log('Remote port is disconnected, reconnecting...');
          openPort(extensionID);
        }
      );

      return myPort;
    },
    []
  );

  useEffect(
    () => {
      if (extensionID) {
        const myInnerPort = openPort(extensionID);

        return () => {
          myInnerPort.disconnect();
        };
      }
    },
    [extensionID, openPort] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!active) {
    return (
      <p>Connecting to plugin...</p>
    );
  }

  return (
    <PluginContext.Provider value={port.current}>
      { children }
    </PluginContext.Provider>
  );
};
