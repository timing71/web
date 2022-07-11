import { Helmet } from "react-helmet-async";
import styled from "styled-components";

import { Page } from "../../../components/Page";
import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";
import { DataPanel } from "./DataPanel";
import { Messages } from "./Messages";
import { TimingScreenHeader } from "./TimingScreenHeader";
import { TimingTable } from "./TimingTable";
import { FullscreenContext, useFullscreenContext } from "../../../components/FullscreenContext";
import { Logo } from "../../../components/Logo";
import { useSetting } from "../../settings";
import { Spinner } from "../../../components/Spinner";

const LoadingMessageInner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;

  color: ${ props => props.theme.site.highlightColor };

`;

const LoadingMessage = ({ children }) => (
  <LoadingMessageInner>
    <Logo
      $spin
      size='15vw'
    />
    { children }
  </LoadingMessageInner>
);

const Inner = styled.div`
  min-width: 0;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 3fr 1fr;
  grid-template-columns: minmax(0, 1fr) 2fr 1fr minmax(0, 1fr);

  grid-template-areas: "elapsed flag flag remain" "timing timing timing timing" "messages messages data data";


  & ${LoadingMessageInner} {
    grid-column: 1 / span 4;
    grid-row: 2;
  }

`;

const TimingScreenInner = ({ children }) => {
  const { toggle } = useFullscreenContext();
  return (
    <Inner onDoubleClick={toggle}>
      {children}
    </Inner>
  );
};

export const TimingScreen = ({ children }) => {

  const { manifest } = useServiceManifest();
  const { state } = useServiceState();

  const [ delay, setDelay ] = useSetting('delay');

  const showTable = !!manifest && !!state?.manifest?.colSpec;

  return (
    <FullscreenContext>
      <Page>
        <Helmet>
          <title>{ manifest?.name }</title>
        </Helmet>
        <TimingScreenInner>
          {
            manifest && <TimingScreenHeader />
          }
          {
            showTable && <TimingTable />
          }
          {
            !showTable && (
              <LoadingMessage>
                Waiting for data...
                <div style={{ marginTop: '1em' }}>
                  Delay (seconds):
                  <Spinner
                    min={0}
                    onChange={e => setDelay(e || 0)}
                    value={delay || 0}
                  />
                </div>
              </LoadingMessage>
            )
          }
          <Messages />
          <DataPanel />
          {
            children
          }
        </TimingScreenInner>
      </Page>
    </FullscreenContext>
  );
};
