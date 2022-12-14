import { useCallback } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { Archive, History, OndemandVideo, Quiz, StackedBarChart } from '@styled-icons/material';

import { Button } from "./Button";
import { useFileContext } from "./FileLoaderContext";

const MenuButton = styled(Button)`

  background-color: black;
  flex-basis: 21%;

  margin-bottom: 1em;

`;

const MenuContainer = styled.div`

  align-self: start;
  margin: 0 25%;

  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
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
      <MenuButton
        onClick={() => history.push('/services')}
      >
        <History />
        Recent sessions
      </MenuButton>
      <MenuButton
        onClick={loadReplay}
      >
        <OndemandVideo />
        Load replay
      </MenuButton>
      <MenuButton
        onClick={loadAnalysis}
      >
        <StackedBarChart />
        Load analysis
      </MenuButton>
      <MenuButton
        onClick={() => history.push('faq')}
      >
        <Quiz />
        FAQ
      </MenuButton>
      <MenuButton
        onClick={() => history.push('/archive')}
      >
        <Archive />
        Replay archive
      </MenuButton>
    </MenuContainer>
  );
};
