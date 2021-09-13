/* global chrome */
import { useCallback, useEffect, useState } from "react";

const META_NAME = 'X-Timing71-Extension';

const getMetaValue = key => {
  if (typeof(document) === 'undefined') {
    return null;
  }
  const meta = document.head.querySelector(`meta[name=${key}]`);
  return meta !== null ? meta.getAttribute('value') : null;
};


export const PluginDetector = ({ children }) => {

  const [extensionID, setExtensionID] = useState(null);

  const [found, setFound] = useState(false);

  const findExtension = useCallback(
    () => {
      if (!extensionID) {
        const maybeID = getMetaValue(META_NAME);
        if (maybeID) {
          setExtensionID(maybeID);
        }
        else {
          window.setTimeout(findExtension, 500);
        }
      }
    },
    [extensionID, setExtensionID]
  );

  useEffect(
    () => {
      findExtension();
    },
    [findExtension]
  );

  useEffect(
    () => {
      if (extensionID) {
        const port = chrome.runtime.connect(extensionID);

        port.onMessage.addListener(
          (message) => {
            if (message.type === 'HANDSHAKE_RETURN') {
              setFound(true);
            }
          }
        );

        port.postMessage({ type: 'HANDSHAKE' });

        return () => {
          port.disconnect();
        };
      }
    },
    [extensionID]
  );

  if (!found) {
    return (
      <p>Connecting to plugin...</p>
    );
  }

  return (
    <>
      {children}
    </>
    );
};
