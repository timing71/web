import { useCallback, useEffect, useState } from 'react';
import { Delete, OpenInBrowser, StackedBarChart } from '@styled-icons/material';
import { dasherizeParts, dayjs } from '@timing71/common';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';


import { useConnectionService } from '../ConnectionServiceProvider';

import { Button } from '../components/Button';
import { Page } from '../components/Page';
import { Helmet } from 'react-helmet-async';
import { Logo } from '../components/Logo';
import { GlobalBackButton } from '../components/GlobalBackButton';
import { AnalysisButton, ReplayButton } from '../components/GeneratorButton';

const Wrapper = styled.div`
  padding: 1em;
  margin-left: 10%;
`;

const ServiceTable = styled.table`

width: 100%;
border-collapse: collapse;

& th {
  color: ${ props => props.theme.site.highlightColor };
  text-align: left;
  font-family: ${ props => props.theme.site.headingFont };
}

& tr:nth-child(even) {
  background-color: #202020;
}

& td {
  padding: 0.5em;
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

const DeleteButton = ({ reload, uuid }) => {
  const [ isDeleting, setDeleting ] = useState(false);

  const cs = useConnectionService();

  const doDelete = useCallback(
    () => {
      setDeleting(true);
      cs.send({ type: 'DELETE_SERVICE', uuid }).then(
        () => {
          reload();
        }
      );
    },
    [cs, reload, uuid]
  );

  return (
    <Button
      danger
      disabled={isDeleting}
      onClick={doDelete}
      title='Delete'
    >
      <Delete size={24} />
    </Button>
  );

};

const UnwrappingCell = styled.td`
  white-space: nowrap;
`;

const WrappingCell = styled.td`
  word-wrap: break-word;
  word-break: break-all;
`;

const ServiceEntry = ({ openAnalysis, reload, service }) => {

  const name = service.state?.manifest?.name ? dasherizeParts(service.state.manifest.name, service.state.manifest.description) : service.source;

  const duration = service.state?.manifest?.startTime && service.state?.lastUpdated ?
  dayjs.duration(service.state.lastUpdated - service.state.manifest.startTime).format('HH:mm:ss') :
  '-';

  return (
    <tr>
      <UnwrappingCell>
        { dayjs(service.startTime).format("YYYY-MM-DD HH:mm:ss") }
      </UnwrappingCell>
      <WrappingCell>{name}</WrappingCell>
      <UnwrappingCell>{duration}</UnwrappingCell>
      <UnwrappingCell>
        <RouteryButton
          title='Open'
          to={`/timing/${service.uuid}`}
        >
          <OpenInBrowser size={24} />
        </RouteryButton>
        <Button
          onClick={() => openAnalysis(service.uuid)}
          title='Launch analysis'
        >
          <StackedBarChart size={24} />
        </Button>
        <ReplayButton uuid={service.uuid} />
        <AnalysisButton uuid={service.uuid} />
        <DeleteButton
          reload={reload}
          uuid={service.uuid}
        />
      </UnwrappingCell>
    </tr>
  );
};

const PageTitle = styled.h2`
  display: flex;
  align-items: center;
  margin-top: 0;

  & svg {
    margin-right: 0.5em;
  }
`;

export const Services = () => {

  const cs = useConnectionService();
  const [services, setServices] = useState(null);

  const openAnalysis = useCallback(
    serviceUUID => {
      cs.send({ type: 'SHOW_T71_PAGE', page: `analysis/${serviceUUID}` });
    },
    [cs]
  );

  const reload = useCallback(
    () => {
      cs.send({ type: 'RETRIEVE_SERVICES_LIST' }).then(
        msg => setServices(msg.services || [])
      );
    },
    [cs]
  );

  useEffect(reload, [reload]);

  return (
    <Page>
      <Helmet>
        <title>Recent sessions</title>
      </Helmet>
      <GlobalBackButton />
      <Wrapper>
        <PageTitle>
          <Logo
            $spin
            size='2em'
          />
          Recent sessions
        </PageTitle>
        <p>
          This page lists recent timing sessions. You can reconnect to them,
          launch the analysis screen, or download a replay file. Sessions will
          automatically be deleted after 7 days, or you can delete them manually.
        </p>
        {
          services !== null && (
            <ServiceTable>
              <thead>
                <tr>
                  <th>
                    Started at
                  </th>
                  <th>
                    Source
                  </th>
                  <th>
                    Duration
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
                        reload={reload}
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
