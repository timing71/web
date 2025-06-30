import { useCallback, useEffect, useState } from 'react';
import { Delete, Lock, LockOpen, OpenInBrowser, StackedBarChart } from '@styled-icons/material';
import { dayjs, timeWithHours } from '@timing71/common';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';


import { useConnectionService } from '../ConnectionServiceProvider';

import { Button } from '../components/Button';
import { BottomRow, Description, Duration, Inner, Series, TopRow } from '../components/ServiceCard';
import { Page } from '../components/Page';
import { Helmet } from 'react-helmet-async';
import { Logo } from '../components/Logo';
import { GlobalBackButton } from '../components/GlobalBackButton';
import { AnalysisButton, ReplayButton } from '../components/GeneratorButton';

const Wrapper = styled.div`
  padding: 1em;
  margin-left: 10%;
`;

const ServiceTable = styled.div`
  display: grid;
  grid-template-columns: repeat(4, auto);
  align-items: center;
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

const DeleteButton = ({ disabled, reload, uuid }) => {
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
      disabled={disabled || isDeleting}
      onClick={doDelete}
      title='Delete'
    >
      <Delete size={24} /> Delete
    </Button>
  );

};

const SessionEntry = ({ index, service, session }) => {
  const duration = session?.manifest?.startTime && session?.lastUpdated ?
  dayjs.duration(session.lastUpdated - session.manifest.startTime).asSeconds() :
  null;

  if (!session?.manifest) {
    return null;
  }

  return (
    <Inner>
      <TopRow>
        <Series>{session.manifest.name}</Series>
      </TopRow>
      <Description>
        {session.manifest.description}
      </Description>
      <BottomRow>
        <Duration>
          {dayjs(session.manifest.startTime).format('HH:mm')}
        </Duration>
        <ReplayButton
          sessionIndex={index}
          uuid={service.uuid}
        />
        <AnalysisButton
          sessionIndex={index}
          uuid={service.uuid}
        />
        <Duration>
          {timeWithHours(duration)}
        </Duration>
      </BottomRow>
    </Inner>
  );
};

const EntryWrapper = styled.div`
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / span 4;

  background-color: #202020;

  padding: 0.5em;
  align-items: center;
`;

const SessionsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(auto, 1fr));
  grid-column: 1 / span 4;
  column-gap: 2em;

  margin: 2em 4em 4em 4em;

  & ${Description} {
    margin: 1em 0;
  }

  & ${Button} {
    margin-bottom: 0.25em;
  }
`;

const Actions = styled.div`
  display: flex;
  column-gap: 1em;
`;

const ServiceEntry = ({ openAnalysis, reload, service, setProtection }) => {
  const finalState = service.sessions ? service.sessions[service.sessions.length - 1] : null;

  const duration = service.startTime && finalState?.lastUpdated ?
  dayjs.duration(finalState.lastUpdated - service.startTime).format('HH:mm:ss') :
  '-';

  return (
    <>
      <EntryWrapper>
        <div>
          { dayjs(service.startTime).format('D MMM YYYY') }
        </div>
        <div>{service.source}</div>
        <div>{duration}</div>
        <Actions>
          <RouteryButton
            title='Open'
            to={`/timing/${service.uuid}`}
          >
            <OpenInBrowser size={24} /> Open
          </RouteryButton>
          <Button
            onClick={() => openAnalysis(service.uuid)}
            title='Launch analysis'
          >
            <StackedBarChart size={24} /> Analysis
          </Button>
          <Button
            onClick={() => setProtection(service.uuid, !service.protectFromDeletion)}
          >
            { service.protectFromDeletion && (<><Lock size={24} /> Unprotect</>)}
            { !service.protectFromDeletion && (<><LockOpen size={24} /> Protect</>)}
          </Button>
          <DeleteButton
            disabled={service.protectFromDeletion}
            reload={reload}
            uuid={service.uuid}
          />
        </Actions>
      </EntryWrapper>
      <SessionsWrapper>
        {
          (service.sessions || (service.state ? [service.state] : [])).map(
            (session, idx) => (
              <SessionEntry
                index={idx}
                key={idx}
                service={service}
                session={session}
              />
            )
          )
        }
      </SessionsWrapper>
    </>
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

const Heading = styled.div`
  padding: 1em 0;
  font-weight: bold;
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

  const setProtection = useCallback(
    (uuid, protectFromDeletion) => {
      cs.send({ type: 'SET_SERVICE_PROTECTION', uuid, protectFromDeletion }).then(reload);
    },
    [cs, reload]
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
          This page lists your recent timing sessions. You can reconnect to
          them, launch the analysis screen, or download a replay file. Unless
          marked as "protected", sessions will automatically be deleted after 7
          days, or you can delete them manually.
        </p>
        {
          services !== null && (
            <ServiceTable>
              <Heading>
                Date started
              </Heading>
              <Heading>
                Source
              </Heading>
              <Heading>
                Duration
              </Heading>
              <Heading>
                Actions
              </Heading>
                {
                  services.sort((a, b) => b.startTime - a.startTime).map(
                    service => (
                      <ServiceEntry
                        key={service.uuid}
                        openAnalysis={openAnalysis}
                        reload={reload}
                        service={service}
                        setProtection={setProtection}
                      />
                    )
                  )
                }
            </ServiceTable>
          )
        }
      </Wrapper>
    </Page>
  );
};
