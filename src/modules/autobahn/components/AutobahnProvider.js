import { useEffect, useRef, useState } from "react";
import autobahn from 'autobahn';

import { ConnectionState, LoadingState } from "../constants";
import { AutobahnContext, INITIAL_CONTEXT } from "../context";
import { useRelayList } from "../hooks";

export const AutobahnProvider = ({ children }) => {

  const [providerState, setProviderState] = useState(INITIAL_CONTEXT);

  const { state } = providerState;

  const [relays, loadingState] = useRelayList();

  const connection = useRef();
  const [liveClients, setLiveClients] = useState(0);

  useEffect(
    () => {
      let newConnectionState = LoadingState.NOT_LOADED;

      if (loadingState === LoadingState.LOADING) {
        newConnectionState = ConnectionState.LOADING_RELAYS;
      }
      else if (loadingState === LoadingState.LOADED) {
        newConnectionState = ConnectionState.RELAYS_LOADED;
      }
      else if (loadingState === LoadingState.FAILED) {
        newConnectionState = ConnectionState.FAILED;
      }

      setProviderState(p => ({ ...p, state: newConnectionState }));
    },
    [loadingState]
  );

  useEffect(
    () => {
      if (state === ConnectionState.RELAYS_LOADED && relays.length > 0 && liveClients > 0) {
        connection.current = new autobahn.Connection({
          transports: [{
            type: 'websocket',
            url: relays[0]
          }],
          realm: "timing",
          max_retries: 3,
        });

        connection.current.onopen = (session) => {
          setProviderState({
            session,
            state: ConnectionState.CONNECTED
          });
        };

        connection.current.onclose = () => {
          setProviderState({
            session: null,
            state: ConnectionState.NOT_CONNECTED
          });
        };

        connection.current.open();

      }
    },
    [liveClients, relays, state]
  );

  useEffect(
    () => {
      const closeIfUnused = () => {
        if (liveClients === 0 && providerState.state === ConnectionState.CONNECTED) {
          connection.current?.close();
          setProviderState({
            session: null,
            state: ConnectionState.RELAYS_LOADED
          });
        }
      };

      const timeout = setTimeout(closeIfUnused, 10 * 1000);

      return () => {
        timeout && clearTimeout(timeout);
      };
    }
  );

  useEffect(
    // Close connection when this provider unmounts
    () => {
      return () => {
        connection.current?.close();
      };
    },
    []
  );

  return (
    <AutobahnContext.Provider
      value={{
        ...providerState,
        liveClients,
        start: () => setLiveClients(c => c + 1),
        stop: () => setLiveClients(c => c - 1)
      }}
    >
      { children }
    </AutobahnContext.Provider>
  );
};
