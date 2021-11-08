import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import { Button } from '../components/Button';

import { Page } from '../components/Page';
import { PluginContext } from '../modules/pluginBridge';

const Wrapper = styled.div`
  padding: 1em;
`;

const ServiceTable = styled.table`

width: 100%;

& th {
  color: ${ props => props.theme.site.highlightColor };
  text-align: left;
  font-family: ${ props => props.theme.site.headingFont };
}

& td button {
  margin-right: 0.5em;
}

`;

const RouteryButton = ({ to, ...props }) => {
  const history = useHistory();
  return (
    <Button
      onClick={() => history.push(to)}
      {...props}
    />
  );
};

const ReplayButton = ({ uuid }) => {

  const [isGenerating, setGenerating] = useState(false);
  const port = useContext(PluginContext);

  useEffect(
    () => {
      const handleMessage = (message) => {
        if (message?.uuid === uuid && message.type === 'REPLAY_GENERATION_FINISHED') {
          setGenerating(false);
        }
      };

      port.on('message', handleMessage);

      return () => {
        port.removeListener('message', handleMessage);
      };
    },
    [uuid, port]
  );

  const startGeneration = useCallback(
    () => {
      port.send({ type: 'GENERATE_SERVICE_REPLAY', uuid }).then(
        () => setGenerating(true)
      );
    },
    [port, uuid]
  );


  return (
    <Button
      disabled={isGenerating}
      onClick={startGeneration}
    >
      {
        isGenerating ? 'Generating...' : 'Generate replay'
      }
    </Button>
  );
};

const ServiceEntry = ({ service }) => (
  <tr>
    <td>{service.source}</td>
    <td>
      { dayjs(service.startTime).format("YYYY-MM-DD HH:mm:ss") }
    </td>
    <td>
      <RouteryButton to={`/timing/${service.uuid}`}>
        Reconnect
      </RouteryButton>
      <ReplayButton uuid={service.uuid} />
    </td>
  </tr>
);


export const Services = () => {

  const port = useContext(PluginContext);
  const [services, setServices] = useState(null);

  useEffect(
    () => {
      port.send({ type: 'RETRIEVE_SERVICES_LIST' }).then(
        msg => setServices(msg.services || [])
      );
    },
    [port]
  );

  return (
    <Page>
      <Wrapper>
        <h2>Recent local sessions</h2>
        <p>
          This page lists recent timing sessions. You can reconnect to them or
          download a replay file. Inactive sessions will automatically be deleted
          after 24 hours.
        </p>
        {
          services !== null && (
            <ServiceTable>
              <thead>
                <tr>
                  <th>
                    Source
                  </th>
                  <th>
                    Started at
                  </th>
                  <th>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  services.map(
                    service => (
                      <ServiceEntry
                        key={service.uuid}
                        service={service}
                      />
                    )
                  )
                }
              </tbody>
            </ServiceTable>
          )
        }
      </Wrapper>
    </Page>
  );
};
