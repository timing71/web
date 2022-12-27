import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { GlobalBackButton } from "../components/GlobalBackButton";
import { Page } from "../components/Page";
import { Section } from "../components/Section";
import { CHROME_STORE_URL } from "../constants";

import background from '../img/timing_screen_blurred.jpg';

const HomeInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  background: top center / cover no-repeat fixed url(${background});
`;

export const FAQ = () => (
  <Page>
    <Helmet>
      <title>FAQ</title>
    </Helmet>
    <HomeInner>
      <GlobalBackButton />

      <Section>
        <h2>What is Timing71?</h2>
        <p>
          Timing71 is the <b>ultimate race companion for motorsport fans</b>.
          The next iteration of Timing71's popular motorsport live timing and
          analysis system, it can provide real-time views on all sorts of race
          data, including highlighting of significant events in the race and
          deep-dives into race strategy and session statistics.
        </p>
        <p>
          Timing71 is { ' ' }
          <a href="https://github.com/timing71/web">open source</a>, and
          made available under the GNU Affero GPL v3, as is the { ' ' }
          <a href="https://github.com/timing71/beta-chrome">browser extension</a>.
        </p>
      </Section>

      <Section>
        <h2>What are its key features?</h2>
        <ul>
          <li>
            An iconic and hugely popular <b>main timing screen</b> layout
          </li>
          <li>
            <b>Colour-coding</b> of key information such as car classes, pit
            in/out, personal bests and more
          </li>
          <li>
            Highlighting of <b>key race events</b> such as pit stops, fastest
            laps, and caution periods
          </li>
          <li>
            Comprehensive <b>real-time strategy analysis suite</b> used by race
            teams, commentators and fans
          </li>
          <li>
            <b>Delay the timing feed</b> to match your TV pictures - avoid any
            spoilers!
          </li>
          <li>
            <b>Download and view</b> timing replays and analysis data from
            previous races and sessions
          </li>
        </ul>
      </Section>

      <Section>
        <h2>How does it work?</h2>
        <p>
          Running as a browser extension, Timing71 is able to download, process,
          analyse and display timing data directly from a number of
          supported providers.
        </p>
        <p>
          Starting on any web page with a supported live timing feed, you can
          launch Timing71 to immediately view the race state in the familiar
          and easy-to-read timing screen from Timing71. All the "magic" happens
          in your browser!
        </p>
      </Section>

      <Section>
        <h2>How do I get started?</h2>
        <ul>
          <li>
            Install the <a href={CHROME_STORE_URL}>Timing71 Chrome extension</a> from the <a href={CHROME_STORE_URL}>Chrome Web Store</a>.
          </li>
          <li>Navigate to any supported live timing page.</li>
          <li>Click the "Launch Timing71" button that will appear on the page.</li>
        </ul>
      </Section>

      <Section>
        <h2>Do you have permission from <em>$timing_provider</em> to use their data?</h2>
        <p>
          With Timing71, timing data does not go via Timing71's
          servers; users are directly downloading the timing data that providers
          make available on their own websites.
        </p>
      </Section>

      <Section>
        <h2>How does it compare to the &quot;old&quot; Timing71?</h2>
        <p>
          The primary difference is that timing data is accessed directly from
          timing providers rather than via Timing71's servers.. This means that
          you do need to have Timing71 open for the entirety of a session
          in order to gain full analysis data.
        </p>
        <p>
          Because Timing71 relies on a browser extension, it cannot be used
          on mobile devices. It's only tested on Google Chrome, but in theory
          should work on MS Edge. Sorry, but Firefox does not support the
          features used in the extension.
        </p>
        <p>
          As there's no centralised data processing, we cannot offer a library
          of replays and post-session analysis (but you can generate your own
          replay files, and eventually, analysis files too).
        </p>
        <p>
          As it all runs on your computer, it's able to do a lot more with
          real-time analysis without needing to worry about server load - so the
          analysis suite is (in time becoming) even more fully-featured than in
          the previous site.
        </p>
        <p>
          Timing71 is always a work-in-progress, so new features will continue
          to be added over time. It remains a hobby project and dependent on my
          having spare time to work on it!
        </p>
      </Section>
    </HomeInner>
  </Page>
);
