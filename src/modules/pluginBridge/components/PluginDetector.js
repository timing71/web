import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { PluginContextProvider } from "./PluginContextProvider";

const META_NAME = 'X-Timing71-Extension';

const getMetaValue = key => {
  if (typeof(document) === 'undefined') {
    return null;
  }
  const meta = document.head.querySelector(`meta[name=${key}]`);
  return meta !== null ? meta.getAttribute('value') : null;
};

const DefaultBeforeDetection = () => <LoadingScreen message='Checking for Chrome extension...' />;


export const PluginDetector = ({ beforeDetection=DefaultBeforeDetection, children, limit=5 }) => {

  const [extensionID, setExtensionID] = useState(null);
  const tries = useRef(limit);

  const findExtension = useCallback(
    () => {
      if (!extensionID) {
        const maybeID = getMetaValue(META_NAME);
        if (maybeID) {
          setExtensionID(maybeID);
        }
        else if (tries.current > 0) {
          tries.current = tries.current - 1;
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
    const Component = beforeDetection;
    return (
      <Component />
    );
  }

  return (
    <PluginContextProvider extensionID={extensionID}>
      {children}
    </PluginContextProvider>
    );
};
