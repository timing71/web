import { Helmet } from "react-helmet";
import styled from "styled-components";
import { Page } from "../../../components/Page";
import { Messages } from "./Messages";
import { TimingScreenHeader } from "./TimingScreenHeader";
import { TimingTable } from "./TimingTable";

const TimingScreenInner = styled.div`
  min-width: 0;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 3fr 1fr;
  grid-template-columns: minmax(0, 1fr) 2fr 1fr minmax(0, 1fr);

  grid-template-areas: "elapsed flag flag remain" "timing timing timing timing" "messages messages trackdata trackdata";

`;

export const TimingScreen = ({ state }) => {
  return (
    <Page>
      <Helmet>
        <title>{ state.manifest?.name }</title>
      </Helmet>
      <TimingScreenInner>
        <TimingScreenHeader state={state} />
        <TimingTable state={state} />
        <Messages messages={state.messages} />
      </TimingScreenInner>
    </Page>
  );
};
