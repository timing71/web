import { useCallback, useContext, useEffect, useRef } from "react";

import { Client } from './client';
import { useSocketIo } from "../../socketio";
import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";
import { PluginContext } from "../../pluginBridge";

export const Service = ({ host, name, service: { uuid } }) => {
  const port = useContext(PluginContext);
  const { updateManifest } = useServiceManifest();
  const { updateState } = useServiceState();

  const onUpdate = useCallback(
    (client) => {
      updateState(client.getState());
    },
    [updateState]
  );

  const client = useRef();

  useEffect(
    () => {
      if (!client.current) {
        client.current = new Client(host.replace('data.', 'live.'), name, onUpdate, updateManifest, port.fetch);
      }
    },
    [host, name, onUpdate, updateManifest, port]
  );



  useSocketIo(host, uuid, client.current?.handle);

  return null;
};
