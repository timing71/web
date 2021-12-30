import { observer } from "mobx-react-lite";
import styled from 'styled-components';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import { useAnalysis } from './context';

dayjs.extend(duration);

const Outer = styled.div`
  grid-area: flag;
  padding: 0.5em;
`;

const Panel = styled.div`
  padding: 0.5em;
  text-align: center;
  font-size: large;

  background: ${ props => props.theme.flagStates[props.flag]?.background || 'black' };
  color: ${ props => props.theme.flagStates[props.flag]?.color || 'white' };
`;

export const FlagPanel = observer(
  () => {
    const analysis = useAnalysis();
    const session = analysis.state.session;

    const delta = analysis.referenceTimestamp() - analysis.state.lastUpdated;

    return (
      <Outer>
        <Panel flag={session.flagState}>
          {
            session.lapsRemain !== undefined ? (
              <span>{session.lapsRemain} lap{session.lapsRemain === 1 ? '' : 's'} remaining</span>
            ) : (
              <span>{dayjs.duration((1000 * session.timeRemain) - delta).format('HH:mm:ss')} remaining</span>
            )
          }
        </Panel>
      </Outer>
    );
  }
);
