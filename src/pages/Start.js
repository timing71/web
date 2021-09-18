import { useContext, useEffect, useState } from 'react';
import { Redirect } from 'react-router';

import { v4 as uuid } from 'uuid';

import { PluginContext } from '../modules/pluginBridge';


export const Start = ({ location: { search } }) => {

  const usp = new URLSearchParams(search);
  const source = usp.get('source');

  const port = useContext(PluginContext);

  const [serviceUUID, setServiceUUID] = useState(null);

  useEffect(
    () => {
      const myUUID = uuid();

      port.onMessage.addListener(
        msg => {
          if (msg.type === 'START_SERVICE_RETURN' && msg.originalMessage?.uuid === myUUID) {
            setServiceUUID(myUUID);
          }
        }
      );

      port.postMessage({
        type: 'START_SERVICE',
        uuid: myUUID,
        source
      });
    },
    [port, source]
  );

    return !!serviceUUID ? <Redirect to={`/timing/${serviceUUID}`} /> : <p>Starting service...</p>;

};
