import { observer } from "mobx-react-lite";
import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { useAnalysis } from "../context";
import { PitStopsTable } from "./PitStopsTable";
import { StopStats } from "./StopStats";

const Column = styled.div`

  display: flex;
  flex-direction: column;

  flex: 1 1 ${props => props.flexBasis || 'auto'};

  height: 100vh;
  min-height: 0;
  overflow-y: auto;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;

  table {
    align-self: start;
  }

  text {
    font-family: ${ props => props.theme.site.headingFont };
    fill: ${ props => props.theme.site.highlightColor };
    font-weight: bold;
    font-size: large;
  }

  ${Column} {
    margin: 0 1em;
  }
`;

export const PitStops = observer(
  ({ match: { params: { raceNum } } }) => {
    const analysis = useAnalysis();
    const car = analysis.cars.get(raceNum);

    return (
      <>
        <Helmet>
          <title>#{raceNum} — Pit stops</title>
        </Helmet>
        <Container>
          <Column flexBasis='60%'>
            <h2>Pit stops: #{raceNum} - {car?.identifyingString}</h2>
            <PitStopsTable raceNum={raceNum} />
          </Column>
          <Column flexBasis='40%'>
            <h3>Pit stops</h3>
            <StopStats raceNum={raceNum} />
          </Column>
        </Container>
      </>
    );
  }
);
