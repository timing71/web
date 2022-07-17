import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { Page } from '../components/Page';
import { Section } from '../components/Section';
import { ImageChanger } from '../components/ImageChanger';

import { CHROME_STORE_URL } from '../constants';

import chromeStore from '../img/chrome_store.png';
import background from '../img/timing_screen_blurred.jpg';
import launchT71 from '../img/launch_t71.png';
import addToChrome from '../img/add_to_chrome.png';
import { PluginContext, PluginDetector } from '../modules/pluginBridge';
import { Footer } from '../components/Footer';
import { useCallback, useContext } from 'react';
import { Button } from '../components/Button';
import { Logo as LogoComponent } from '../components/Logo';

const HomeInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  height: 100vh;

  background: top center / cover no-repeat fixed url(${background});
`;

const LogosBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background-color: rgba(0, 0, 0, 0.6);
  margin: 3em;
  border-radius: 5px;
`;

const Logo = styled(LogoComponent).attrs(
  () => ({ alt: 'Timing71.org BETA' })
)`
  max-width: 40%;
  max-height: 180px;
`;

const LaunchImage = styled.img`
  box-shadow: 8px 8px black;
  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-radius: 5px;
`;

const StartNow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;

const Content = styled.div`
  flex-grow: 1;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LaunchButtonInner = styled(Button)`
  font-size: xx-large;
  background-color: black;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LaunchButton = () => {

  const port = useContext(PluginContext);

  const showPage = useCallback(
    (page) => {
      port.send({
        type: 'SHOW_T71_PAGE',
        page,
        devMode: process.env.NODE_ENV === 'development'
      });
    },
    [port]
  );

  return (
    <LaunchButtonInner onClick={() => showPage('menu')}>
      <Logo />
      <span>
        Launch Timing71 main menu
      </span>
    </LaunchButtonInner>
  );
};

const DefaultContent = () => (
  <Content>
    <Section>
      <h2>Get started now!</h2>
      <StartNow>
        <ol>
          <li>
            Install the <a href={CHROME_STORE_URL}>Timing71 Beta Chrome extension</a> from the <a href={CHROME_STORE_URL}>Chrome Web Store</a>.
          </li>
          <li>
            Visit any supported live timing page. More will be added over time!
          </li>
          <li>
            Click the "Launch Timing71" button and enjoy the racing!
          </li>
        </ol>
        <ImageChanger
          delay={5}
          imageComponent={LaunchImage}
          images={[
            addToChrome,
            launchT71,
          ]}
        />
      </StartNow>
      <p style={{ textAlign: 'center' }}>
        Want to find out more? { ' ' }
        <Link to='/faq'>
          Visit our FAQ page
        </Link>.
      </p>
    </Section>
  </Content>
);


export const Home = () => (
  <Page>
    <HomeInner>
      <LogosBox>
        <Logo $text />
        <a href={CHROME_STORE_URL}>
          <img
            alt='Available in the Chrome Web Store'
            src={chromeStore}
          />
        </a>
      </LogosBox>
      <PluginDetector
        beforeDetection={DefaultContent}
      >
        <Content>
          <LaunchButton />
        </Content>
      </PluginDetector>
      <Footer />
    </HomeInner>
  </Page>
);
