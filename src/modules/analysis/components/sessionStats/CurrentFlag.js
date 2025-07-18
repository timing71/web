import { dayjs } from '@timing71/common';
import { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { useAnalysis } from "../context";
import { Cell, Heading } from "../Table";
import { FlagCell } from "../FlagCell";

export const CurrentFlag = observer(
  () => {
    const analysis = useAnalysis();

    const current = analysis.session.flagStats[analysis.session.flagStats.length - 1];
    const startTime = current.startTime;

    const [duration, setDuration] = useState(current ? Math.max(0, analysis.referenceTimestamp() - current.startTime) : 0);

    const updateDuration = useCallback(
      () => {
        startTime && setDuration(Math.max(0, analysis.referenceTimestamp() - startTime));
      },
      [analysis, startTime]
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
      <>
        <thead>
          <tr>
            <Heading>Current flag</Heading>
            <Heading right>Since</Heading>
            <Heading right>Duration</Heading>
            <Heading right>Laps</Heading>
          </tr>
        </thead>
        <tbody>
          <tr>
            <FlagCell
              animated
              flag={current.flag}
            />
            <Cell right>
              {dayjs(current.startTime).format('HH:mm:ss')}
            </Cell>
            <Cell right>
              { dayjs.duration(duration).format('HH:mm:ss') }
            </Cell>
            <Cell right>
              { Math.max(0, analysis.session.leaderLap - current.startLap - 1) }
            </Cell>
          </tr>
        </tbody>
      </>
    );
  }
);
