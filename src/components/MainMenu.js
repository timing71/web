import styled from "styled-components";

import { History, OndemandVideo, Quiz, StackedBarChart } from '@styled-icons/material';

import { Button } from "./Button";
import { useHistory } from "react-router-dom";

const MenuButton = styled(Button)`

  background-color: black;
  flex-basis: 20%;

`;

const MenuContainer = styled.div`

  align-self: start;
  margin: 0 25%;

  display: flex;
  justify-content: space-between;
`;

export const MainMenu = () => {

  const history = useHistory();

  return (
    <MenuContainer>
      <MenuButton
        onClick={() => history.push('/services')}
      >
        <History />
        Recent sessions
      </MenuButton>
      <MenuButton
        onClick={() => history.push('replay')}
      >
        <OndemandVideo />
        Load replay
      </MenuButton>
      <MenuButton
        onClick={() => history.push('file-analysis')}
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
    </MenuContainer>
  );
};
