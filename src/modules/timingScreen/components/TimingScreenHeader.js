import styled from "styled-components";
import { Clock } from "./Clock";

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

export const TimingScreenHeader = ({ state: { manifest, session } }) => (
  <>
    {
      session && session.timeElapsed >= 0 && (
        <Clock
          caption='elapsed'
          pause={session?.pauseClocks}
          seconds={session.timeElapsed}
        />
      )
    }
    <FlagPanel flag={session.flagState}>{manifest.name} - {manifest.description}</FlagPanel>
    {
      session && session.timeRemain >= 0 && (
        <Clock
          caption='remaining'
          countdown
          pause={session?.pauseClocks}
          seconds={session.timeRemain}
        />
      )
    }
  </>
);
