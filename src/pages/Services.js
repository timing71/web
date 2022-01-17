import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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

const GeneratorButton = ({ children, finishMessage, progressMessage, startMessage, uuid }) => {

  const [isGenerating, setGenerating] = useState(false);
  const port = useContext(PluginContext);
  const [progress, setProgress] = useState(null);

  useEffect(
    () => {
      const handleMessage = (message) => {
        if (message?.uuid === uuid) {
          if (message.type === finishMessage) {
            setGenerating(false);
          }
          else if (message.type === progressMessage) {
            setProgress(message.progress);
          }
        }
      };

      port.on('message', handleMessage);

      return () => {
        port.removeListener('message', handleMessage);
      };
    },
    [finishMessage, port, progressMessage, uuid]
  );

  const startGeneration = useCallback(
    () => {
      port.send({ type: startMessage, uuid }).then(
        () => setGenerating(true)
      );
    },
    [port, startMessage, uuid]
  );


  return (
    <Button
      disabled={isGenerating}
      onClick={startGeneration}
    >
      {
        isGenerating ? 'Generating...' : children
      }
      {
        isGenerating && progress !== null ? ` (${progress.percent}%)`: null
      }
    </Button>
  );
};

const ReplayButton = ({ uuid }) => (
  <GeneratorButton
    finishMessage='REPLAY_GENERATION_FINISHED'
    progressMessage='REPLAY_GENERATION_PROGRESS'
    startMessage='GENERATE_SERVICE_REPLAY'
    uuid={uuid}
  >
    Download replay
  </GeneratorButton>
);

const AnalysisButton = ({ uuid }) => (
  <GeneratorButton
    finishMessage='ANALYSIS_GENERATION_FINISHED'
    startMessage='GENERATE_ANALYSIS_DOWNLOAD'
    uuid={uuid}
  >
    Download analysis
  </GeneratorButton>
);

const ServiceEntry = ({ openAnalysis, service }) => (
  <tr>
    <td>{service.source}</td>
    <td>
      { dayjs(service.startTime).format("YYYY-MM-DD HH:mm:ss") }
    </td>
    <td>
      <RouteryButton to={`/timing/${service.uuid}`}>
        Reconnect
      </RouteryButton>
      <Button onClick={() => openAnalysis(service.uuid)}>
        Launch analysis
      </Button>
      <ReplayButton uuid={service.uuid} />
      <AnalysisButton uuid={service.uuid} />
    </td>
  </tr>
);


export const Services = () => {

  const port = useContext(PluginContext);
  const [services, setServices] = useState(null);

  const openAnalysis = useCallback(
    serviceUUID => {
      port.send({ type: 'SHOW_T71_PAGE', page: `analysis/${serviceUUID}` });
    },
    [port]
  );

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
          This page lists recent timing sessions. You can reconnect to them,
          launch the analysis screen, or download a replay file. Sessions will
          automatically be deleted after 24 hours of inactivity.
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
                  services.sort((a, b) => b.startTime - a.startTime).map(
                    service => (
                      <ServiceEntry
                        key={service.uuid}
                        openAnalysis={openAnalysis}
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
