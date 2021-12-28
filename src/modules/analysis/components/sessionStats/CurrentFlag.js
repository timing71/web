import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';
import { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import styled from 'styled-components';

import { useAnalysis } from "../context";
import { Table } from "../Table";

dayjs.extend(duration);

const FlagCell = styled.td.attrs(
  props => ({
    ...props,
    children: <span>{props.flag}</span>
  })
)`

  text-transform: uppercase;

  background: ${ props => props.theme.flagStates[props.flag]?.background || 'black' };
  color: ${ props => props.theme.flagStates[props.flag]?.color || 'white' };
  animation: ${ props => props.theme.flagStates[props.flag]?.animation || 'none' };
`;

export const CurrentFlag = observer(
  () => {
    const analysis = useAnalysis();

    const current = analysis.session.flagStats[analysis.session.flagStats.length - 1];

    const [duration, setDuration] = useState(current ? Date.now() - current.startTime : 0);

    const updateDuration = useCallback(
      () => {
        current && setDuration(Date.now() - current.startTime);
      },
      [current]
    );

    useEffect(
      () => {
        const interval = setInterval(
          updateDuration,
          1000
        );
        return () => {
          clearInterval(interval);
        };
      },
      [updateDuration]
    );

    if (!current) {
      return null;
    }

    return (
      <Table>
        <thead>
          <tr>
            <th>Current flag</th>
            <th>Since</th>
            <th>Duration</th>
            <th>Laps</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <FlagCell flag={current.flag} />
            <td>
              {dayjs(current.startTime).format('HH:mm:ss')}
            </td>
            <td>
              { dayjs.duration(duration).format('HH:mm:ss') }
            </td>
            <td>
              { Math.max(0, analysis.session.leaderLap - current.startLap - 1) }
            </td>
          </tr>
        </tbody>

      </Table>
    );
  }
);
