import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { Table } from "../Table";
import { CurrentFlag } from "./CurrentFlag";
import { FlagHistoryTable } from "./FlagHistoryTable";

const Container = styled.div`

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: minmax(0, 1fr) minmax(0, 3fr);

  height: 100%;

`;

export const SessionStats = () => {
  return (
    <>
      <Helmet>
        <title>Session statistics</title>
      </Helmet>
      <Container>
        <div>AAA</div>
        <div>BBB</div>
        <div>
          <h3>Flag statistics</h3>
          <Table>
            <CurrentFlag />
            <FlagHistoryTable />
          </Table>
        </div>
        <div>DDD</div>
      </Container>
    </>
  );
};
