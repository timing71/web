import styled from "styled-components";
import { dayjs, timeWithHours } from '@timing71/common';
import { Download } from "styled-icons/material";

import { Button } from '../../../components/Button';
import { API_ROOT } from "../api";

const Inner = styled.div`
  border: 1px solid green;
  border-radius: 0.25em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  background-color: #292929;

  transition: background-color 0.25s ease-in-out;

  &:hover {
    background-color: #404040;
  }
`;

const Series = styled.div`
  font-family: ${ props => props.theme.site.headingFont };
  background-color: green;
  padding: 0.5em;
  align-self: flex-start;

  border-bottom-right-radius: 0.25em;
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
    border-color: #00FF00;

    &:hover {
    background-color: #00FF00;
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

const loadReplay = (id) => {
  window.location.href = `${API_ROOT}/download/${id}`;
};

export const Replay = ({ replay }) => {
  return (
    <Inner data-id={replay.id}>
      <Series>{replay.series}</Series>
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
        <DownloadButton disabled>
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
