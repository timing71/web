import { createContext, useCallback, useContext } from "react";

import fscreen from 'fscreen';
import { useWakeLock } from 'react-screen-wake-lock';

const FSContext = createContext();

export const FullscreenContext = ({ children }) => {

  const wakeLock = useWakeLock();

  const toggle = useCallback(
    () => {
      if (fscreen.fullscreenEnabled) {
        if (fscreen.fullscreenElement !== null) {
          fscreen.exitFullscreen();
          wakeLock.release();
        }
        else {
          fscreen.requestFullscreen(document.body);
          wakeLock.request();
        }
      }
    },
    [wakeLock]
  );

  return (
    <FSContext.Provider
      value={{
        active: fscreen.fullscreenElement !== null,
        toggle
      }}
    >
      { children }
    </FSContext.Provider>
  );

};

export const useFullscreenContext = () => useContext(FSContext);
