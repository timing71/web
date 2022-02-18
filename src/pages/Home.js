import styled from 'styled-components';
import InlineSVG from 'react-inlinesvg';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import { MainMenu } from '../components/MainMenu';
import { Page } from '../components/Page';
import { Section } from '../components/Section';
import { ImageChanger } from '../components/ImageChanger';

import { CHROME_STORE_URL, PAYPAL_DONATE_LINK } from '../constants';

import logo from '../img/logo.svg';
import chromeStore from '../img/chrome_store.png';
import background from '../img/timing_screen_blurred.jpg';
import launchT71 from '../img/launch_t71.png';
import addToChrome from '../img/add_to_chrome.png';
import { Paypal } from 'styled-icons/fa-brands';
import { PluginDetector } from '../modules/pluginBridge';

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

const Logo = styled(InlineSVG).attrs(
  () => ({ alt: 'Timing71.org BETA', src: logo })
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

const Footer = styled.div`

  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  justify-content: space-around;

  padding: 1em;

  background-color: rgba(0, 0, 0, 0.6);
  border-top: 1px solid ${ props => props.theme.site.highlightColor };

  font-size: small;
`;

const CopyrightYear = () => (
  <span>
    2016–{ dayjs().format('YYYY') }
  </span>
);

const PP = styled(Paypal)`
  width: 1em;
`;

const DefaultContent = () => (
  <>
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
  </>
);

export const Home = () => (
  <Page>
    <HomeInner>
      <LogosBox>
        <Logo />
        <a href={CHROME_STORE_URL}>
          <img
            alt='Available in the Chrome Web Store'
            src={chromeStore}
          />
        </a>
      </LogosBox>
      <PluginDetector
        defaultBefore={DefaultContent}
      >
        <MainMenu />
      </PluginDetector>
      <Footer>
        <span>
          Timing71 and Timing71 Beta are copyright &copy; <CopyrightYear /> James Muscat.
        </span>
        <a href="mailto:info@timing71.org">info@timing71.org</a>
        <a
          href={PAYPAL_DONATE_LINK}
          rel='noreferrer'
          target='_blank'
        >
          Donate via <PP /> PayPal
        </a>
      </Footer>
    </HomeInner>
  </Page>
);
