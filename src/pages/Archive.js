import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { GlobalBackButton } from "../components/GlobalBackButton";
import { Page } from "../components/Page";
import { Section } from "../components/Section";
import { ArchiveMenu } from "../modules/archive";

import background from '../img/timing_screen_blurred.jpg';

const HomeInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  background: top center / cover no-repeat fixed url(${background});
  min-height: 100vh;
`;

const FullHeightSection = styled(Section)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 90vh;
`;

export const Archive = () => (
  <Page>
    <Helmet>
      <title>Timing71 Archive</title>
    </Helmet>
    <HomeInner>
      <GlobalBackButton to='/menu' />

      <FullHeightSection>
        <h2>Timing71 Archive</h2>
        <ArchiveMenu />
      </FullHeightSection>

    </HomeInner>
  </Page>
);

export default Archive;
