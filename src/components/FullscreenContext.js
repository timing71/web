import { createContext, useCallback, useContext } from "react";

import { FullScreen, useFullScreenHandle } from "react-full-screen";

const FSContext = createContext();

export const FullscreenContext = ({ children }) => {

  const fsHandle = useFullScreenHandle();

  const toggle = useCallback(
    () => {
      if (fsHandle.active) {
        fsHandle.exit();
      }
      else {
        fsHandle.enter();
      }
    },
    [fsHandle]
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
