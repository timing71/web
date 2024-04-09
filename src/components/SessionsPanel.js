import { dayjs } from '@timing71/common';
import styled from "styled-components";
import { PlayArrow } from "@styled-icons/material-sharp";
import { Timer } from "@styled-icons/material-outlined";

import { useUpcomingQuery } from '../modules/replay';
import { raceday } from '../modules/archive';
import { Logo } from './Logo';

const Inner = styled.div`
  background-color: #202020;
  border: 1px solid ${props => props.theme.site.highlightColor};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const Header = styled.h3`
  margin: 0;
  padding: 0.5em;

  border-bottom: 1px solid ${props => props.theme.site.highlightColor};
  background-color: black;
  border-radius: 4px 4px 0 0;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SessionsList = styled.div`
  flex: 1 0;
  overflow-y: auto;
  min-height: 0;
`;

const Loading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;

  color: ${ props => props.theme.site.highlightColor };
`;

const SessionInner = styled.a`
  margin: 0.5em;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  grid-auto-flow: column;

  background-color: ${ props => props.$live ? 'green' : 'black'};
  color: white;
  border: 2px solid black;
  border-radius: 4px;

  cursor: pointer;

  text-decoration: none;
  font-family: ${props => props.theme.site.headingFont};

  & > svg {
    grid-row: 1 / span 2;
    align-self: center;
    margin: 0 0.5em;
    height: 32px;
    color: ${ props => props.$live ? 'white' : '#808080' };
  }

  & h4.title {
    padding: 0.5em;
    margin: 0;
  }

  & span {
    background-color: #202020;
    padding: 0.5em;
    border-bottom-left-radius: 1px;
  }

  &:hover {
    background-color: ${ props => props.$live ? '#009900' : '#202020'};
    color: white;

    & span {
      background-color: #303030;
    }
  }
`;

const Session = ({ session: { description, source, start, started } }) => {
  return (
    <SessionInner
      $live={started}
      href={source}
      rel="noreferrer"
      target="_blank"
    >
      <h4 className="title">
        {description}
      </h4>
      <span>
        {dayjs(start).format('D MMM YYYY HH:mm')}
      </span>
      { started ? <PlayArrow /> : <Timer /> }
    </SessionInner>
  );
};

export const SessionsPanel = () => {

  const sessions = useUpcomingQuery();

  return (
    <Inner>
      <Header>
        Upcoming events
        <a
          href="https://raceday.watch/"
          rel="noreferrer"
          target="_blank"
        >
          <img
            alt='RaceDay.watch'
            src={raceday}
          />
        </a>
      </Header>
      <SessionsList>
        {
          sessions.isLoading && (
            <Loading>
              <Logo
                $spin
                size='5vw'
              />
              Loading...
            </Loading>
          )
        }
        {
          sessions.isSuccess && sessions.data.items.map(
            s => (
              <Session
                key={s.sessionID}
                session={s}
              />
            )
          )
        }
      </SessionsList>
    </Inner>
  );
};
