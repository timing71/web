import { useCallback, useRef } from "react";

import { Client } from './client';
import { useSocketIo } from "../../socketio";

export const Service = ({ children, host, name, service: { uuid }, updateManifest, updateState }) => {

  const onUpdate = useCallback(
    (client) => {
      updateManifest(client.getManifest());
      updateState(client.getState());
    },
    [updateManifest, updateState]
  );

  const client = useRef(new Client(name, onUpdate));

  useSocketIo(host, uuid, client.current.handle);

  return (
    <>
      { children }
    </>
  );

};
