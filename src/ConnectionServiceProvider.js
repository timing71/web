import { createContext, useContext } from "react";

const ConnectionServiceContext = createContext();

export const ConnectionServiceProvider = ({ children, connectionService }) => (
  <ConnectionServiceContext.Provider value={connectionService} >
    { children }
  </ConnectionServiceContext.Provider>
);

export const useConnectionService = () => useContext(ConnectionServiceContext);
