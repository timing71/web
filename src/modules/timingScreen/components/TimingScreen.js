import { Helmet } from "react-helmet-async";
import styled from "styled-components";

import { Page } from "../../../components/Page";
import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";
import { DataPanel } from "./DataPanel";
import { Messages } from "./Messages";
import { TimingScreenHeader } from "./TimingScreenHeader";
import { TimingTable } from "./TimingTable";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { FullscreenContext, useFullscreenContext } from "../../../components/FullscreenContext";

const Inner = styled.div`
  min-width: 0;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 3fr 1fr;
  grid-template-columns: minmax(0, 1fr) 2fr 1fr minmax(0, 1fr);

  grid-template-areas: "elapsed flag flag remain" "timing timing timing timing" "messages messages data data";

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

  return (
    <FullscreenContext>
      <Page>
        <Helmet>
          <title>{ manifest?.name }</title>
        </Helmet>
        {
          state && (
            <TimingScreenInner>
              <TimingScreenHeader />
              <TimingTable />
              <Messages />
              <DataPanel />
              {
                children
              }
            </TimingScreenInner>
          )
        }
        {
          !state && (
            <LoadingScreen message='Waiting for data...' />
          )
        }
      </Page>
    </FullscreenContext>
  );
};
