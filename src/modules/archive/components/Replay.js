import styled from "styled-components";
import { dayjs, timeWithHours } from '@timing71/common';
import { Download, Podcasts } from "styled-icons/material";

import { Button } from '../../../components/Button';
import { API_ROOT } from "../api";

const Series = styled.div`
  font-family: ${ props => props.theme.site.headingFont };
  padding: 0.5em;

  border-top-left-radius: 0.25em;
  border-bottom-right-radius: 0.25em;
`;

const SyndicateInner = styled.div`
  font-family: ${ props => props.theme.site.headingFont };
  padding: 0.5em 0.5em 0.25em 0.5em;

  border-top-right-radius: 0.25em;
  border-bottom-left-radius: 0.25em;

  font-size: small;

  & svg {
    width: 1.5em;
    margin-right: 0.25em;
    margin-bottom: 0.25em;
  }
`;

const TopRow = styled.div`
  justify-self: flex-start;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
`;

const Description = styled.div`
  padding: 0.5em;
  text-align: center;
`;

const BottomRow = styled.div`
  justify-self: flex-end;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
`;

const Duration = styled.div`
  background-color: #404040;
  color: white;
  padding: 0.5em;
  font-size: small;

  &:first-child {
    border-bottom-left-radius: 0.25em;
    border-top-right-radius: 0.25em;
  }

  &:last-child {
    border-bottom-right-radius: 0.25em;
    border-top-left-radius: 0.25em;
  }
`;

const DownloadButton = styled(Button)`
  margin: 0.5em;

  &:not(:disabled) {
    color: #00FF00;
    background-color: black;

    &:hover {
    color: black;
  }
  }

  display: flex;
  align-items: center;

  & > svg {
    width: 1.2em;
    margin-right: 0.25em;
    margin-top: 0.1em;
  }

`;

const Inner = styled.div`
  border: 1px solid ${ props => props.syndicated ? props.theme.replay.syndicatedButtonColor : props.theme.replay.buttonColor };
  border-radius: 0.25em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  background-color: #292929;

  transition: background-color 0.25s ease-in-out;

  &:hover {
    background-color: ${ props => props.syndicated ? props.theme.replay.syndicatedHoverColor : props.theme.replay.hoverColor };
  }

  & ${Series}, & ${SyndicateInner} {
    background-color: ${ props => props.syndicated ? props.theme.replay.syndicatedColor : props.theme.replay.color };
  }

  & ${DownloadButton}:not(:disabled) {
    border-color: ${ props => props.syndicated ? props.theme.replay.syndicatedButtonColor : props.theme.replay.buttonColor };
    color: ${ props => props.syndicated ? props.theme.replay.syndicatedButtonColor : props.theme.replay.buttonColor };

    &:hover {
      background-color: ${ props => props.syndicated ? props.theme.replay.syndicatedButtonColor : props.theme.replay.buttonColor };
      color: black;
    }
  }

  & a {
    text-decoration: none;
    color: white;
    transition: color 0.25s ease-in-out;

    &:hover {
      color: ${ props => props.syndicated ? props.theme.replay.syndicatedButtonColor : props.theme.replay.buttonColor };
    }
  }
`;

const Syndicate = ({ replay }) => {

  const content = (
    <>
      <Podcasts />
      {replay.syndicateName}
    </>
  );

  return (
    <SyndicateInner title={`This event was run on the Timing71 network by ${replay.syndicateName}.`}>
      <span>
        { replay.syndicateURL ? (<a href={replay.syndicateURL}>{content}</a>) : content }
      </span>
    </SyndicateInner>
  );
};

const loadReplay = (id) => {
  window.location.href = `${API_ROOT}/download/${id}`;
};

const loadAnalysis = (id) => {
  window.location.href = `${API_ROOT}/analysis/${id}`;
};

export const Replay = ({ replay }) => {
  return (
    <Inner
      data-id={replay.id}
      syndicated={!!replay.syndicateName}
    >
      <TopRow>
        <Series>{replay.series}</Series>
        {
          replay.syndicateName && (
            <Syndicate replay={replay} />
          )
        }
      </TopRow>
      <Description>
        {replay.description}
      </Description>
      <BottomRow>
        <Duration>
          {dayjs(replay.startTime * 1000).format('D MMM YYYY')}
        </Duration>
        <DownloadButton onClick={() => loadReplay(replay.id)}>
          <Download />
          Replay
        </DownloadButton>
        <DownloadButton
          disabled={!replay.analysisFilename}
          onClick={() => loadAnalysis(replay.id)}
        >
          <Download />
          Analysis
        </DownloadButton>
        <Duration>
          { timeWithHours(replay.duration) }
        </Duration>
      </BottomRow>
    </Inner>
  );
};
