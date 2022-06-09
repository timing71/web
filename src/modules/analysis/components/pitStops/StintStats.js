import { observer } from "mobx-react-lite";

import dayjs from '../../../../datetime';
import { useAnalysis } from "../context";
import { Cell, Heading, Row, Table } from "../Table";

export const StintStats = observer(
  ({ raceNum }) => {
    const analysis = useAnalysis();
    const car = analysis.cars.get(raceNum);
    const referenceTimestamp = analysis.referenceTimestamp();

    const durations = car.stints.map(
      s => s.durationSeconds ? s.durationSeconds * 1000 : (referenceTimestamp - s.startTime)
    );

    const lapDurations = car.stints.map(
      s => s.durationLaps || s.laps.length
    );

    const maxTime = Math.max(...durations);
    const maxLaps = Math.max(...lapDurations);
    const minTime = Math.min(...durations);
    const minLaps = Math.min(...lapDurations);

    const totalTime = durations.reduce((a,b) => a + b, 0);

    return (
      <Table>
        <thead>
          <Row>
            <Heading right>Total stints</Heading>
            <Cell>{car.stints.length}</Cell>
            <Heading right>Total time on track</Heading>
            <Cell>
              { totalTime ? dayjs.duration(totalTime).format('HH:mm:ss') : '-' }
            </Cell>
          </Row>
        </thead>
        <tbody>
          <Row>
            <Heading right>Longest stint</Heading>
            <Cell>{maxLaps} lap{ maxLaps === 1 ? '' : 's' }</Cell>
            <Heading right>Duration</Heading>
            <Cell>{ maxTime ? dayjs.duration(maxTime).format('HH:mm:ss') : '' }</Cell>
          </Row>
          <Row>
            <Heading right>Shortest stint</Heading>
            <Cell>{minLaps} lap{ minLaps === 1 ? '' : 's' }</Cell>
            <Heading right>Duration</Heading>
            <Cell>{ minTime ? dayjs.duration(minTime).format('HH:mm:ss') : '' }</Cell>
          </Row>
        </tbody>
      </Table>
    );
  }
) ;
