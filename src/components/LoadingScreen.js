import styled from 'styled-components';

import { Page } from "./Page";
import { Logo } from "./Logo";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;

  color: ${ props => props.theme.site.highlightColor };
`;

export const LoadingScreen = ({ message }) => (
  <Page>
    <Container>
      <Logo
        size='15vw'
        spin
      />
      { message }
    </Container>
  </Page>
);
