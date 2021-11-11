import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

import { Page } from "../../../components/Page";
import { useServiceManifest } from "../../../components/ServiceContext";
import { DataPanel } from "./DataPanel";
import { MenuBar } from "./MenuBar";
import { Messages } from "./Messages";
import { TimingScreenHeader } from "./TimingScreenHeader";
import { TimingTable } from "./TimingTable";

const TimingScreenInner = styled.div`
  min-width: 0;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 3fr 1fr;
  grid-template-columns: minmax(0, 1fr) 2fr 1fr minmax(0, 1fr);

  grid-template-areas: "elapsed flag flag remain" "timing timing timing timing" "messages messages data data";

`;

export const TimingScreen = () => {

  const { manifest } = useServiceManifest();
  const fsHandle = useFullScreenHandle();

  return (
    <FullScreen handle={fsHandle}>
      <Page>
        <Helmet>
          <title>{ manifest?.name }</title>
        </Helmet>
        <TimingScreenInner>
          <TimingScreenHeader />
          <TimingTable />
          <Messages />
          <DataPanel />
          <MenuBar fsHandle={fsHandle} />
        </TimingScreenInner>
      </Page>
    </FullScreen>
  );
};
