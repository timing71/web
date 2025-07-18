import { dayjs } from '@timing71/common';
import { observer } from "mobx-react-lite";
import { useState } from "react";
import styled from "styled-components";
import { useAnalysis } from "../context";
import { GradientDefs } from "../GradientDefs";
import { Cell, Table } from "../Table";
import { FlagCell } from "../FlagCell";
import { FlagRect } from "../FlagRect";

const FlagsContainer = styled.svg.attrs(
  props => ({
    ...props,
    preserveAspectRatio: 'none'
  })
)`
  width: 100%;
  height: 48px;
`;

const ShownTable = styled(Table)`
  font-family: ${ props => props.theme.site.headingFont };

  & ${Cell}:first-child {
    width: 33%;
  }
`;

const ShownStat = ({ stat }) => (
  <ShownTable>
    <tbody>
      <tr>
        <FlagCell flag={stat.flag} />
        <Cell>Start: {dayjs(stat.startTime).format('HH:mm:ss')}</Cell>
        <Cell>
          {
            (stat.endTime && (
              <span>
                End: {dayjs(stat.endTime).format('HH:mm:ss')}
              </span>
            )) || <span>In progress</span>
          }
        </Cell>
        <Cell>
          {
            (stat.endTime && (
              <span>
                Duration: {dayjs.duration(stat.endTime - stat.startTime).format('HH:mm:ss')}
              </span>
            ))
          }
        </Cell>
      </tr>
    </tbody>
  </ShownTable>
);

const TimeContainer = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${ props => props.theme.site.headingFont };
  font-size: small;

  margin-bottom: 0.5em;
`;

const ShownHighlightLine = ({ latestTimestamp, startTime, stat }) => {
  const start = Math.floor((stat.startTime - startTime) / 1000);
  const width = Math.max(0, Math.floor(((stat.endTime || latestTimestamp || Date.now()) - stat.startTime) / 1000));
  const end = start + width;
  return (
    <line
      stroke='#54FFFF'
      strokeWidth={8}
      x1={start}
      x2={end}
      y1={48}
      y2={48}
    />
  );
};

export const FlagHistoryChart = observer(
  () => {
    const analysis = useAnalysis();

    const [shown, setShown] = useState(null);

    const startTime = analysis.session.flagStats.length > 0 ? analysis.session.flagStats[0].startTime : null;
    const endTime = analysis.session.flagStats[analysis.session.flagStats.length - 1].endTime || analysis.latestTimestamp || Date.now();
    const flagStats = analysis.session.flagStats;

    if (!startTime) {
      return null;
    }

    return (
      <div>
        <FlagsContainer viewBox={`0 0 ${Math.floor((endTime - startTime) / 1000)} 48`}>
          <defs>
            <GradientDefs />
          </defs>
          {
            flagStats.map(
              (stat, idx) => (
                <FlagRect
                  flag={stat.flag}
                  height={48}
                  key={idx}
                  onMouseOut={() => setShown(null)}
                  onMouseOver={() => setShown(stat)}
                  width={Math.max(0, Math.floor(((stat.endTime || analysis.latestTimestamp || Date.now()) - stat.startTime) / 1000))}
                  x={Math.floor((stat.startTime - startTime) / 1000)}
                  y={0}
                />
              )
            )
          }
          {
            shown && (
              <ShownHighlightLine
                latestTimestamp={analysis.latestTimestamp}
                startTime={startTime}
                stat={shown}
              />
            )
          }
        </FlagsContainer>
        <TimeContainer>
          <span>{dayjs(startTime).format('HH:mm')}</span>
          <span>{dayjs(endTime).format('HH:mm')}</span>
        </TimeContainer>
        { shown && <ShownStat stat={shown} /> }
      </div>
    );
  }
);
