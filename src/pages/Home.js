import styled from 'styled-components';
import { Page } from '../components/Page';
import logo from '../img/logo.svg';

const HomeInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.img.attrs(
  () => ({ alt: 'Timing71.org BETA', src: logo })
)`
  max-width: 40%;
  max-height: 180px;
`;

const Section = styled.div`
  border: 1px solid ${ props => props.theme.site.highlightColor };
  border-radius: 0.5em;

  width: 75%;
  margin: 1em;
  padding: 0;

  background-color: #202020;

  & > h2 {
    margin: 0;
    padding: 0.5em;
    border-bottom: 1px solid ${ props => props.theme.site.highlightColor };
    font-family: ${ props => props.theme.site.headingFont };
    background-color: black;
    border-radius: 0.5em 0.5em 0 0;
  }

  & > p {
    padding: 0 2em;
  }

`;

export const Home = () => (
  <Page>
    <HomeInner>
      <Logo />
      <Section>
        <h2>What is Timing71 Beta?</h2>
        <p>
          Timing71 Beta is the next iteration of Timing71's motorsport live timing
          and analysis system. It can provide real-time views on all sorts of
          race data, including highlighting of significant events in the race
          and deep-dives into race strategy and session statistics.
        </p>
        <p>
          The goal of the Beta project is to fully decentralise Timing71, no
          longer relying on a centralised network to process and redistribute
          timing data and so avoid the associated intellectual property
          challenges that Timing71 has.
        </p>
        <p>
          Timing71 Beta is { ' ' }
          <a href="https://github.com/timing71/beta-web">open source</a>, and
          made available under the GNU Affero GPL v3, as is the { ' ' }
          <a href="https://github.com/timing71/beta-chrome">browser extension</a>.
        </p>
      </Section>
      <Section>
        <h2>How does it work?</h2>
        <p>
          Running as a browser extension, Timing71 Beta is able to download,
          process, analyse and display timing data directly from a number of
          supported providers.
        </p>
        <p>
          Starting on any web page with a supported live timing feed, you can
          launch Timing71 Beta to immediately view the race state in the familiar
          and easy-to-read timing screen from Timing71. All the "magic" happens
          in your browser!
        </p>
      </Section>
      <Section>
        <h2>How do I get started?</h2>
        <ul>
          <li>Install the Timing71 Beta extension for Google Chrome.</li>
          <li>Navigate to any supported live timing page.</li>
          <li>Click the "Launch Timing71" button.</li>
        </ul>
      </Section>
      <Section>
        <h2>How does it compare to the &quot;old&quot; Timing71?</h2>
        <p>
          The primary difference is that Timing71 is (or rather, <em>I</em> am!)
          no longer accessing data from timing providers; instead <em>you</em> { ' ' }
          are accessing that data directly. This means that you do need to have
          Timing71 Beta open for the entirety of a session in order to gain full
          analysis data.
        </p>
        <p>
          Because Timing71 Beta relies on a browser extension, it cannot be used
          on mobile devices. It's only tested on Google Chrome, but in theory
          should work on MS Edge and Mozilla Firefox too.
        </p>
        <p>
          As there's no centralised data processing, we cannot offer a library
          of replays and post-session analysis (but hope to be able to offer
          similar functionality, allowing you to make your own replay files).
        </p>
        <p>
          And as the name suggests - Timing71 Beta is a work-in-progress, so is
          currently missing many of the features Timing71 users will be
          familiar with.
        </p>
      </Section>
    </HomeInner>
  </Page>
);
