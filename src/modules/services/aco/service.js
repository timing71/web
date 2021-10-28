import { useCallback, useRef } from "react";

import { Client } from './client';
import { useSocketIo } from "../../socketio";
import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";

export const Service = ({ host, name, service: { uuid } }) => {

  const { updateManifest } = useServiceManifest();
  const { updateState } = useServiceState();

  const onUpdate = useCallback(
    (client) => {
      updateManifest(client.getManifest());
      updateState(client.getState());
    },
    [updateManifest, updateState]
  );

  const client = useRef(new Client(name, onUpdate));

  useSocketIo(host, uuid, client.current.handle);

  return null;
};
