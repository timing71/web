import styled from 'styled-components';

import { Cell, Heading, Table } from '../../Table';
import dayjs from '../../../../../datetime';

const SDTable = styled(Table)`

  width: 60%;

  tbody ${Heading}:first-child {
    border-right: 1px solid ${ props => props.theme.site.highlightColor };
  }

`;

export const StintDetailTable = ({ stint }) => (
  <SDTable>
    <thead>
      <tr>
        <td></td>
        <Heading center>Start</Heading>
        <Heading center>End</Heading>
        <Heading center>Duration</Heading>
      </tr>
    </thead>
    <tbody>
      <tr>
        <Heading right>Time</Heading>
        <Cell center>{ dayjs(stint.startTime).format('HH:mm:ss') }</Cell>
        <Cell center>{ stint.inProgress ? '-' : dayjs(stint.endTime).format('HH:mm:ss') }</Cell>
        <Cell center>{ stint.inProgress ? '-' : dayjs.duration(stint.endTime - stint.startTime).format('HH:mm:ss') }</Cell>
      </tr>
      <tr>
        <Heading right>Lap</Heading>
        <Cell center>Lap { stint.startLap }</Cell>
        <Cell center>Lap { stint.endLap }</Cell>
        <Cell center>{ stint.durationLaps } lap{ stint.durationLaps === 1 ? '' : 's' }</Cell>
      </tr>
      <tr>
        <Heading right>Best lap</Heading>
        <Cell center>{ stint.bestLap ? dayjs.duration(Math.round(stint.bestLap * 1000)).format("m:ss.SSS") : '-' }</Cell>
        <Heading right>Yellow laps</Heading>
        <Cell
          center
          style={{ color: '#DDDD00' }}
        >
          { stint.yellowLaps }
        </Cell>
      </tr>
      <tr>
        <Heading right>Average lap</Heading>
        <Cell center>{ stint.meanLap ? dayjs.duration(Math.round(stint.meanLap * 1000)).format("m:ss.SSS") : '-' }</Cell>
      </tr>
    </tbody>
  </SDTable>
);
