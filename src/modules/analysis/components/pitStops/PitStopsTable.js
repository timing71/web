import { observer } from "mobx-react-lite";
import { useAnalysis } from "../context";
import dayjs from '../../../../datetime';
import { Cell, Heading, Row, Table } from "../Table";

const PitStopRow = ({ pitStop, referenceTimestamp }) => (
  <Row inProgress={pitStop.inProgress}>
    <Cell right>{ pitStop.prevStint?.durationLaps }</Cell>
    <Cell right>{ pitStop.prevStint?.durationSeconds && dayjs.duration(pitStop.prevStint.durationSeconds * 1000).format('HH:mm:ss') }</Cell>
    <Cell right>{dayjs(pitStop.startTime).format('HH:mm:ss')}</Cell>
    <Cell right>{pitStop.endTime ? dayjs(pitStop.endTime).format('HH:mm:ss') : 'In progress'}</Cell>
    <Cell right>
      {
        pitStop.durationSeconds ?
          dayjs.duration(pitStop.durationSeconds * 1000).format('HH:mm:ss')
          : dayjs.duration(referenceTimestamp - pitStop.startTime).format('HH:mm:ss')
      }
    </Cell>
  </Row>
);

export const PitStopsTable = observer(
  ({ raceNum }) => {
    const analysis = useAnalysis();
    const pitStops = analysis.cars.get(raceNum)?.pitStops || [];
    const referenceTimestamp = analysis.referenceTimestamp();

    return (
      <Table>
        <thead>
          <Row>
            <Heading right>Prev stint laps</Heading>
            <Heading right>Prev stint duration</Heading>
            <Heading right>Start time</Heading>
            <Heading right>End time</Heading>
            <Heading right>Duration</Heading>
          </Row>
        </thead>
        <tbody>
          {
            pitStops.map(
              (p, idx) => (
                <PitStopRow
                  key={idx}
                  pitStop={p}
                  referenceTimestamp={referenceTimestamp}
                />
              )
            )
          }
        </tbody>
      </Table>
    );
  }
);
