import { useCallback, useEffect, useState } from "react";
import { PluginContextProvider } from "./PluginContextProvider";

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

  if (!extensionID) {
    return (
      <p>Locating plugin...</p>
    );
  }

  return (
    <PluginContextProvider extensionID={extensionID}>
      {children}
    </PluginContextProvider>
    );
};
