import styled from "styled-components";

import { Page } from "../components/Page";
import { MainMenu as MainMenuUI } from '../components/MainMenu';
import { Footer } from "../components/Footer";
import { Logo } from '../components/Logo';

import background from '../img/timing_screen_blurred.jpg';

const Container = styled.div`

  display: grid;

  grid-template-rows: auto 1fr auto;

  height: 100vh;
  width: 100vw;
  align-items: center;

  background: top center / cover no-repeat fixed url(${background});

  & ${Logo} {
    justify-self: center;
  }

`;

export const MainMenu = () => (
  <Page>
    <Container>
      <Logo
        $text
        size='25em'
      />
      <MainMenuUI />
      <Footer />
    </Container>
  </Page>
);
