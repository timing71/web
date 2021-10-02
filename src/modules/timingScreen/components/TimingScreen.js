import styled from "styled-components";
import { Page } from "../../../components/Page";
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
      <TimingScreenInner>
        <TimingScreenHeader state={state} />
        <TimingTable state={state} />
      </TimingScreenInner>
    </Page>
  );
};
