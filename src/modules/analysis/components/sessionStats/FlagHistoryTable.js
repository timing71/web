import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";

import { useAnalysis } from "../context";
import { Cell, Heading, Row } from "../Table";
import { FlagCell } from "./FlagCell";

dayjs.extend(duration);

const AggregateRow = ({ flag, count, time, laps, additionalLapsFrom, additionalTimeFrom, leaderLap, latestTimestamp }) => {

  const [extraTime, setExtraTime] = useState(additionalTimeFrom ? ((latestTimestamp || Date.now()) - additionalTimeFrom) : 0);

  const extraLaps = additionalLapsFrom ? Math.max(0, (leaderLap - 1 - additionalLapsFrom)) : 0;

  const updateExtraTime = useCallback(
    () => {
      setExtraTime(
        additionalTimeFrom ? ((latestTimestamp || Date.now()) - additionalTimeFrom) : 0
      );
    },
    [additionalTimeFrom, latestTimestamp]
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
                  latestTimestamp={analysis.latestTimestamp}
                  leaderLap={analysis.session.leaderLap}
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
