import { useCallback, useRef } from "react";

import { Client } from './client';
import { useSocketIo } from "../../socketio";
import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";

export const Service = ({ host, name, service: { uuid } }) => {

  const { updateManifest } = useServiceManifest();
  const { updateState } = useServiceState();

  const onUpdate = useCallback(
    (client) => {
      updateState(client.getState());
    },
    [updateState]
  );

  const client = useRef(new Client(name, onUpdate, updateManifest));

  useSocketIo(host, uuid, client.current.handle);

  return null;
};
