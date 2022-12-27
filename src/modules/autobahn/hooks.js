import { useEffect, useState } from "react";
import { RELAY_LIST_URL } from "./config";
import { LoadingState } from './constants';

export const useRelayList = () => {
  const [relays, setRelays] = useState([]);
  const [loadingState, setLoadingState] = useState(LoadingState.NOT_LOADED);

  useEffect(
    () => {
      setLoadingState(LoadingState.LOADING);
      fetch(RELAY_LIST_URL).then(
        response => {
          response.json().then(
            relays => {
              setRelays(Object.keys(relays.args[0] || {}));
              setLoadingState(LoadingState.LOADED);
            }
          );
        }
      );
    },
    []
  );

  return [relays, loadingState];
};
