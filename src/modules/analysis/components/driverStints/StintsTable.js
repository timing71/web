import { observer } from "mobx-react-lite";

import { useAnalysis } from "../context";
import { Table, Row, Heading, Cell } from '../Table';
import dayjs from '../../../../datetime';
import styled from "styled-components";

const StintRow = ({ stint, timestamp }) => (
  <Row inProgress={stint.inProgress}>
    <Cell>{stint.driver.name}</Cell>
    <Cell right>{stint.startLap}</Cell>
    <Cell right>{dayjs(stint.startTime).format('HH:mm:ss')}</Cell>
    <Cell right>{stint.endLap || '-'}</Cell>
    <Cell right>{stint.endTime ? dayjs(stint.endTime).format('HH:mm:ss') : 'In progress'}</Cell>
    <Cell right>{stint.durationLaps || stint.laps.length}</Cell>
    <Cell right>{dayjs.duration(stint.durationSeconds * 1000 || timestamp - stint.startTime).format('HH:mm:ss')}</Cell>
    <Cell right>{stint.bestLap ? dayjs.duration(stint.bestLap * 1000).format('m:ss.SSS') : '-'}</Cell>
  </Row>
);

export const StintsTable = styled(
  observer(
    ({ className, raceNum }) => {

      const analysis = useAnalysis();
      const stints = analysis.cars.get(raceNum)?.stints || [];

      return (
        <Table className={className}>
          <thead>
            <Row>
              <Heading>Driver</Heading>
              <Heading right>Start lap</Heading>
              <Heading right>Start time</Heading>
              <Heading right>End lap</Heading>
              <Heading right>End time</Heading>
              <Heading right>Laps</Heading>
              <Heading right>Duration</Heading>
              <Heading right>Best</Heading>
            </Row>
          </thead>
          <tbody>
            {
              stints.map(
                (stint, idx) => (
                  <StintRow
                    key={idx}
                    stint={stint}
                    timestamp={analysis.referenceTimestamp()}
                  />
                )
              )
            }
          </tbody>
        </Table>
      );
    }
  )
)``;
