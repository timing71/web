import { Helmet } from "react-helmet-async";
import styled from "styled-components";

import { CHROME_STORE_URL } from "../constants";
import { GlobalBackButton } from "../components/GlobalBackButton";
import { Page } from "../components/Page";
import { Section } from "../components/Section";
import { ServicesList } from '../modules/network/components/ServicesList';

import background from '../img/timing_screen_blurred.jpg';

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  background: top center / cover no-repeat fixed url(${background});
  height: 100%;
`;

export const HostedServices = () => (
  <Page>
    <Helmet>
      <title>Hosted events</title>
    </Helmet>
    <Inner>
      <GlobalBackButton />
      <Section>
        <h2>Hosted events</h2>
        <ServicesList />
        <p style={{ fontSize: 'small' }}>
          Hosted events are run on the Timing71 network by Timing71 or by
          syndicated partners. Support for other timing providers is via the
          {' '} <a href={CHROME_STORE_URL}>Chrome extension</a>.
        </p>
      </Section>

    </Inner>
  </Page>
);

export default HostedServices;
