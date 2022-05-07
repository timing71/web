import { observer } from "mobx-react-lite";

import { useAnalysis } from "../context";
import { Table, Row, Heading, Cell } from '../Table';
import dayjs from '../../../../datetime';

const DriverRow = ({ driver, timestamp }) => (
  <Row inProgress={driver.inCar}>
    <Cell>{driver.name}</Cell>
    <Cell right>{driver.stints.length}</Cell>
    <Cell right>{driver.totalLaps}</Cell>
    <Cell right>{dayjs.duration(Math.floor(driver.driveTime(timestamp) * 1000)).format('HH:mm:ss')}</Cell>
    <Cell right>{dayjs(Math.floor(driver.bestLap * 1000)).format('m:ss.SSS')}</Cell>
  </Row>
);

export const DriversTable = observer(
  ({ raceNum }) => {
    const analysis = useAnalysis();
    const drivers = analysis.cars.get(raceNum)?.drivers || [];

    return (
      <Table>
        <thead>
          <Row>
            <Heading>Driver</Heading>
            <Heading right>Stints</Heading>
            <Heading right>Laps</Heading>
            <Heading right>Drive time</Heading>
            <Heading right>Best</Heading>
          </Row>
        </thead>
        <tbody>
          {
            drivers.map(
              (d, idx) => (
                <DriverRow
                  driver={d}
                  key={idx}
                  timestamp={analysis.referenceTimestamp()}
                />
              )
            )
          }
        </tbody>
      </Table>
    );
  }
);
