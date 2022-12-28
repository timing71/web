import { useContext, useEffect, useState } from "react";
import { RELAY_LIST_URL } from "./config";
import { LoadingState } from './constants';
import { AutobahnContext } from "./context";

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

export const useSubscription = (topic, options={}) => {
  const [value, setValue] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const { session } = useContext(AutobahnContext);

  useEffect(
    () => {
      if (session && session.subscribe && (!subscription || !subscription.active || subscription.topic !== topic)) {

        if (subscription && subscription.active && subscription.topic !== topic) {
          session.unsubscribe(subscription);
          setValue(null);
        }

        const doSubscribe = async () => {
          const sub = await session.subscribe(
            topic,
            (msg) => {
              if (msg[0]) {
                setValue(msg[0]?.payload);
              }
            },
            options
          );

          sub.on_unsubscribe.then(
            () => setSubscription(null)
          );

          setSubscription(sub);
        };

        doSubscribe();
      }
    },
    [options, session, subscription, topic]
  );

  // Handle unsubscription separately FSR
  useEffect(
    () => () => {
      if (session && session.unsubscribe && subscription && subscription.active) {
        session.unsubscribe(subscription);
      }
    },
    [session, subscription]
  );

  return value;
};
