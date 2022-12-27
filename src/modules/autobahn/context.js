import { createContext } from "react";
import { ConnectionState } from "./constants";

export const INITIAL_CONTEXT = {
  state: ConnectionState.NOT_CONNECTED,
  session: null
};

export const AutobahnContext = createContext(INITIAL_CONTEXT);
