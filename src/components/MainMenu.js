import { useCallback } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { Archive, History, OndemandVideo, Podcasts, Quiz, StackedBarChart } from '@styled-icons/material';

import { Button } from "./Button";
import { useFileContext } from "./FileLoaderContext";
import { URLBox } from "./URLBox";

const MenuButton = styled(Button)`

  background-color: black;
  flex-basis: 21%;

  margin-bottom: 1em;

`;

const MenuContainer = styled.div`

  align-self: start;
  margin: 0 25vw;

  min-width: 600px;

  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-gap: 3vw;
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
      <MenuButton
        onClick={() => history.push('/hosted')}
      >
        <Podcasts />
        Hosted events
      </MenuButton>
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

    </MenuContainer>
  );
};
