import styled from "styled-components";
import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";
import { Clock, ClockInner } from "./Clock";

const FlagPanel = styled.div`
  grid-area: flag;
  font-family: Verdana, monospace;
  text-align: center;
  padding: 0.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  align-self: stretch;

  background: ${ props => props.theme.flagStates[props.flag]?.background || 'black' };
  color: ${ props => props.theme.flagStates[props.flag]?.color || 'white' };
  animation: ${ props => props.theme.flagStates[props.flag]?.animation || 'none' };

`;

export const TimingScreenHeader = () => {

  const { manifest } = useServiceManifest();
  const { state: { session } } = useServiceState();

  const useLaps = session && session.lapsRemain !== undefined;

  return (
    <>
      {
        session && session.timeElapsed >= 0 && (
          <Clock
            caption='elapsed'
            className='left'
            pause={session?.pauseClocks}
            seconds={session.timeElapsed}
          />
        )
      }
      <FlagPanel flag={session.flagState}>{manifest.name} - {manifest.description}</FlagPanel>
      {
        useLaps && (
          <ClockInner>
            {session.lapsRemain} lap{session.lapsRemain === 1 ? '' : 's'} remaining
          </ClockInner>
        )
      }
      {
        !useLaps && session && session.timeRemain >= 0 && (
          <Clock
            caption='remaining'
            className='right'
            countdown
            pause={session?.pauseClocks}
            seconds={session.timeRemain}
          />
        )
      }
    </>
  );
};
