import { dayjs } from '@timing71/common';
import { observer } from "mobx-react-lite";
import styled, { css } from "styled-components";

import { useAnalysis } from "../context";
import { Cell, Heading, Row, Table } from "../Table";

const YellowCell = styled(Cell)`
  ${
    props => props.isYellow && css`
      color: yellow;
    `
  }
`;

const PitStopRow = ({ pitStop, referenceTimestamp }) => (
  <Row inProgress={pitStop.inProgress}>
    <Cell right>{ pitStop.prevStint?.endLap }</Cell>
    <Cell right>{dayjs(pitStop.startTime).format('HH:mm:ss')}</Cell>
    <Cell right>{ pitStop.prevStint?.durationSeconds && dayjs.duration(pitStop.prevStint.durationSeconds * 1000).format('HH:mm:ss') }</Cell>
    <Cell right>{ pitStop.prevStint?.durationLaps }</Cell>
    <YellowCell
      isYellow={pitStop.prevStint?.yellowLaps > 0}
      right
    >
      { pitStop.prevStint?.yellowLaps || '' }
    </YellowCell>
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
            <Heading right>In lap</Heading>
            <Heading right>Pit in time</Heading>
            <Heading right>Prev stint duration</Heading>
            <Heading right>Prev stint laps</Heading>
            <Heading right>Yellow laps</Heading>
            <Heading right>Pit out time</Heading>
            <Heading right>Stop duration</Heading>
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
