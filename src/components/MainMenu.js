import { useCallback, useContext } from "react";
import styled from "styled-components";

import { History, OndemandVideo, Quiz, StackedBarChart } from '@styled-icons/material';

import { PluginContext } from "../modules/pluginBridge";
import { Button } from "./Button";

const MenuButton = styled(Button)`

  background-color: black;
  flex-basis: 20%;

`;

const MenuContainer = styled.div`

  align-self: stretch;
  margin: 0 25%;

  display: flex;
  justify-content: space-between;
`;

export const MainMenu = () => {

  const port = useContext(PluginContext);

  const showPage = useCallback(
    (page) => {
      port.send({
        type: 'SHOW_T71_PAGE',
        page
      });
    },
    [port]
  );

  return (
    <MenuContainer>
      <MenuButton
        onClick={() => showPage('services')}
      >
        <History />
        Recent sessions
      </MenuButton>
      <MenuButton disabled>
        <OndemandVideo />
        Load replay
      </MenuButton>
      <MenuButton
        onClick={() => showPage('file-analysis')}
      >
        <StackedBarChart />
        Load analysis
      </MenuButton>
      <MenuButton
        onClick={() => showPage('faq')}
      >
        <Quiz />
        FAQ
      </MenuButton>
    </MenuContainer>
  );
};
