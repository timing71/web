import { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';

import { v4 as uuid } from 'uuid';
import { LoadingScreen } from '../components/LoadingScreen';
import { useConnectionService } from '../ConnectionServiceProvider';


export const Start = ({ location: { search } }) => {

  const usp = new URLSearchParams(search);
  const source = usp.get('source');

  const cs = useConnectionService();

  const [serviceUUID, setServiceUUID] = useState(null);

  useEffect(
    () => {
      const myUUID = uuid();

      cs.send({
        type: 'START_SERVICE',
        uuid: myUUID,
        source
      }).then(
        setServiceUUID(myUUID)
      );
    },
    [cs, source]
  );

    return !!serviceUUID ?
      <Redirect to={`/timing/${serviceUUID}`} />
    : <LoadingScreen message='Starting timing service...' />;

};
