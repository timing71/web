import { observer } from "mobx-react-lite";

import dayjs from '../../../../datetime';
import { useAnalysis } from "../context";
import { Cell, Heading, Row, Table } from "../Table";

export const StopStats = observer(
  ({ raceNum }) => {

    const analysis = useAnalysis();
    const pitStops = analysis.cars.get(raceNum)?.pitStops || [];
    const referenceTimestamp = analysis.referenceTimestamp();

    const durations = pitStops.map(
      s => s.durationSeconds ? s.durationSeconds * 1000 : (referenceTimestamp - s.startTime)
    );

    const minTime = durations.length > 0 ? Math.min(...durations) : null;
    const maxTime = durations.length > 0 ? Math.max(...durations) : null;
    const totalTime = durations.reduce((a,b) => a + b, 0);
    const aveTime = durations.length > 0 && totalTime / durations.length;

    const isInPits = pitStops.length > 0 && pitStops[pitStops.length - 1].inProgress;

    return (
      <Table>
        <thead>
          {
            isInPits && (
              <Row inProgress>
                <Heading
                  center
                  colSpan={4}
                >Car is in pits</Heading>
              </Row>
            )
          }
          <Row inProgress={isInPits}>
            <Heading>Total stops</Heading>
            <Cell>{ durations.length }</Cell>
            <Heading>Total pit time</Heading>
            <Cell>
              { totalTime ? dayjs.duration(totalTime).format('HH:mm:ss') : '-' }
            </Cell>
          </Row>
        </thead>
        <tbody>
          <Row>
            <Heading right>Shortest</Heading>
            <Cell>
              { minTime ? dayjs.duration(minTime).format('HH:mm:ss') : '-' }
            </Cell>
          </Row>
          <Row>
            <Heading right>Average</Heading>
            <Cell>
              { aveTime ? dayjs.duration(aveTime).format('HH:mm:ss') : '-' }
            </Cell>
          </Row>
          <Row>
            <Heading right>Longest</Heading>
            <Cell>
              { maxTime ? dayjs.duration(maxTime).format('HH:mm:ss') : '-' }
            </Cell>
          </Row>
        </tbody>
      </Table>
    );
  }
);
