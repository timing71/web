import { useCallback } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { Archive, History, OndemandVideo, Quiz, StackedBarChart } from '@styled-icons/material';

import { Button } from "./Button";
import { useFileContext } from "./FileLoaderContext";
import { URLBox } from "./URLBox";
import { SessionsPanel } from './SessionsPanel';

const MenuButton = styled(Button)`

  background-color: black;
  color: white;

  display: flex;
  align-items: center;

  & > svg {
    max-width: 64px;
    margin-right: 1.5em;
    color: ${props => props.theme.site.highlightColor};
  }

  &:hover > svg {
    color: black;
  }

  &:not(:first-child) {
    margin-top: 0.5em;
  }
`;

const MenuContainer = styled.div`

  align-self: start;
  margin: 0 25vw;

  min-width: 600px;

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-gap: 1vw;

  height: 70vh;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

export const MainMenu = () => {

  const history = useHistory();
  const { loadFile } = useFileContext();

  const loadReplay = useCallback(
    () => {
      loadFile('.zip,application/zip').then(
        () => history.push('replay')
      );
    },
    [history, loadFile]
  );

  const loadAnalysis = useCallback(
    () => {
      loadFile('.json,application/json').then(
        () => history.push('file-analysis')
      );
    },
    [history, loadFile]
  );

  return (
    <MenuContainer>
      <URLBox />
      <SessionsPanel />
      <ButtonContainer>
        <MenuButton
          onClick={() => history.push('/services')}
        >
          <History />
          Recent sessions
        </MenuButton>
        <MenuButton
          onClick={() => history.push('/archive')}
        >
          <Archive />
          Replay archive
        </MenuButton>
        <MenuButton
          onClick={() => history.push('faq')}
        >
          <Quiz />
          FAQ
        </MenuButton>
        <MenuButton
          onClick={loadReplay}
        >
          <OndemandVideo />
          Load replay file
        </MenuButton>
        <MenuButton
          onClick={loadAnalysis}
        >
          <StackedBarChart />
          Load analysis file
        </MenuButton>
      </ButtonContainer>
    </MenuContainer>
  );
};
