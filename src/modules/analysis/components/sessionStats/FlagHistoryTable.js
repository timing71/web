import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";

import { useAnalysis } from "../context";
import { Cell, Heading, Row } from "../Table";
import { FlagCell } from "./FlagCell";

dayjs.extend(duration);

const AggregateRow = ({ flag, count, time, laps, additionalLapsFrom, additionalTimeFrom, leaderLap, referenceTimestamp }) => {

  const [extraTime, setExtraTime] = useState(additionalTimeFrom ? (referenceTimestamp() - additionalTimeFrom) : 0);

  const extraLaps = additionalLapsFrom !== undefined ? Math.max(0, (leaderLap - 1 - additionalLapsFrom)) : 0;

  const updateExtraTime = useCallback(
    () => {
      setExtraTime(
        additionalTimeFrom ? (referenceTimestamp() - additionalTimeFrom) : 0
      );
    },
    [additionalTimeFrom, referenceTimestamp]
  );

  useEffect(
    () => {
      const interval = setInterval(updateExtraTime, 1000);
      return () => {
        clearInterval(interval);
      };
    },
    [updateExtraTime]
  );

  return (
    <Row inProgress={!!additionalTimeFrom}>
      <FlagCell flag={flag} />
      <Cell right>
        {count}
      </Cell>
      <Cell right>
        {dayjs.duration(time + extraTime).format('HH:mm:ss')}
      </Cell>
      <Cell right>
        { laps + extraLaps }
      </Cell>
    </Row>
  );
};

export const FlagHistoryTable = observer(
  () => {
    const analysis = useAnalysis();

    const aggregates = analysis.session.aggregateFlagStats;

    return (
      <>
        <thead>
          <tr>
            <Heading>Flag type</Heading>
            <Heading right>Count</Heading>
            <Heading right>Total time</Heading>
            <Heading right>Total laps</Heading>
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(aggregates).map(
              ([flag, aggs]) => (
                <AggregateRow
                  flag={flag}
                  key={flag}
                  leaderLap={analysis.session.leaderLap}
                  referenceTimestamp={analysis.referenceTimestamp}
                  {...aggs}
                />
              )
            )
          }

        </tbody>
      </>
    );
  }
);
