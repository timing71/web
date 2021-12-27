import { useCallback, useEffect, useRef, useState } from "react";

export const useBroadcastChannel = (channelName) => {

  const [data, setData] = useState();
  const channel = useRef();

  const handleMessage = useCallback(
    event => setData(event.data),
    []
  );

  useEffect(
    () => {
      const bc = new BroadcastChannel(channelName);

      bc.addEventListener('message', handleMessage);

      channel.current = bc;

      return () => {
        bc.removeEventListener('message', handleMessage);
        bc.close();
      };

    },
    [channelName, handleMessage]
  );

  const emit = useCallback(
    (data) => channel.current?.postMessage(data),
    [channel]
  );

  return { data, emit };

};
