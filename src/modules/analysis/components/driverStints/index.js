import { observer } from "mobx-react-lite";
import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { useAnalysis } from "../context";
import { DriversTable } from "./DriversTable";
import { DriveShareByLaps } from "./DriveShareByLaps";
import { DriveShareByTime } from "./DriveShareByTime";
import { StintsTable } from "./StintsTable";

const Column = styled.div`

  display: flex;
  flex-direction: column;

  flex: 1 1 ${props => props.flexBasis || 'auto'};

  height: 100vh;
  min-height: 0;
  overflow-y: auto;
`;

const ChartContainer = styled.div`
  flex: 1 1 auto;
  overflow: hidden;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;

  table {
    align-self: start;
  }

  ${StintsTable} {
    grid-row: span 4;
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

export const DriverStints = observer(
  ({ match: { params: { raceNum } } }) => {
    const analysis = useAnalysis();
    const car = analysis.cars.get(raceNum);

    return (
      <>
        <Helmet>
          <title>#{raceNum} — Driver stints</title>
        </Helmet>
        <Container>
          <Column flexBasis='60%'>
            <h2>Driver stints: #{raceNum} - {car?.identifyingString}</h2>
            <StintsTable raceNum={raceNum} />
          </Column>
          <Column flexBasis='40%'>
            <h2>Driver totals</h2>
            <DriversTable raceNum={raceNum} />
            <h2>Drive share</h2>
            <ChartContainer>
              <DriveShareByLaps raceNum={raceNum} />
              <DriveShareByTime raceNum={raceNum} />
            </ChartContainer>
          </Column>
        </Container>
      </>
    );
  }
);
