import { createContext, useContext } from "react";

const DEFAULT_STATE = {
  cars: [],
  session: {},
  messages: [],
  manifest: {}
};

export const ServiceStateContext = createContext({ state: DEFAULT_STATE, updateState: () => {} });

export const ServiceManifestContext = createContext({ manifest: {}, updateManifest: () => {} });

export const useServiceState = () => useContext(ServiceStateContext);

export const useServiceManifest = () => useContext(ServiceManifestContext);
