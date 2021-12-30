import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { Table } from "../Table";
import { CarsPerState } from "./CarsPerState";
import { ClassLeaders } from "./ClassLeaders";
import { CurrentFlag } from "./CurrentFlag";
import { DistancePrediction } from "./DistancePrediction";
import { FlagHistoryChart } from "./FlagHistoryChart";
import { FlagHistoryTable } from "./FlagHistoryTable";

const Container = styled.div`

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: minmax(0, 1fr) minmax(0, 3fr);

  grid-column-gap: 1em;

  height: 100%;

`;

export const SessionStats = () => {
  return (
    <>
      <Helmet>
        <title>Session statistics</title>
      </Helmet>
      <Container>
        <div>
          <h3>Distance prediction</h3>
          <DistancePrediction />
        </div>
        <div>
          <h3>Cars</h3>
          <CarsPerState />
        </div>
        <div>
          <h3>Flag statistics</h3>
          <Table>
            <CurrentFlag />
            <FlagHistoryTable />
          </Table>
          <h3>Flag history</h3>
          <FlagHistoryChart />
        </div>
        <div>
          <h3>Class leaders</h3>
          <ClassLeaders />
        </div>
      </Container>
    </>
  );
};
