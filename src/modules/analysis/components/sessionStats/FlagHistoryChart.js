import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';
import { observer } from "mobx-react-lite";
import { useState } from "react";
import styled from "styled-components";
import { useAnalysis } from "../context";
import { Cell, Table } from "../Table";
import { FlagCell } from "./FlagCell";

dayjs.extend(duration);

const FlagsContainer = styled.svg.attrs(
  props => ({
    ...props,
    preserveAspectRatio: 'none'
  })
)`
  width: 100%;
  height: 48px;
`;

const FlagRect = styled.rect`
  fill: ${ props => props.theme.flagStates[props.flag]?.background || 'black' };
  animation: ${ props => (props.theme.flagStates[props.flag]?.animation) || 'none' };
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

export const FlagHistoryChart = observer(
  () => {
    const analysis = useAnalysis();

    const [shown, setShown] = useState(null);

    const startTime = analysis.session.flagStats.length > 0 ? analysis.session.flagStats[0].startTime : null;

    if (!startTime) {
      return null;
    }

    const endTime = analysis.session.flagStats[analysis.session.flagStats.length - 1].endTime || analysis.latestTimestamp || Date.now();

    return (
      <div>
        <FlagsContainer viewBox={`0 0 ${Math.floor((endTime - startTime) / 1000)} 48`}>
          {
            analysis.session.flagStats.map(
              (stat, idx) => (
                <FlagRect
                  flag={stat.flag}
                  height={48}
                  key={idx}
                  onMouseOut={() => setShown(null)}
                  onMouseOver={() => setShown(stat)}
                  width={Math.floor(((stat.endTime || analysis.latestTimestamp || Date.now()) - stat.startTime) / 1000)}
                  x={Math.floor((stat.startTime - startTime) / 1000)}
                  y={0}
                />
              )
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
