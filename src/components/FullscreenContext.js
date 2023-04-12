import { createContext, useCallback, useContext } from "react";

import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useWakeLock } from 'react-screen-wake-lock';

const FSContext = createContext();

export const FullscreenContext = ({ children }) => {

  const fsHandle = useFullScreenHandle();
  const wakeLock = useWakeLock();

  const toggle = useCallback(
    () => {
      if (fsHandle.active) {
        fsHandle.exit();
        wakeLock.release();
      }
      else {
        fsHandle.enter();
        wakeLock.request();
      }
    },
    [fsHandle, wakeLock]
  );

  return (
    <FSContext.Provider
      value={{
        ...fsHandle,
        toggle
      }}
    >
      <FullScreen handle={fsHandle}>
        { children }
      </FullScreen>
    </FSContext.Provider>
  );

};

export const useFullscreenContext = () => useContext(FSContext);
