import styled from "styled-components";

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
    <FlagPanel flag={session.flagState}>{manifest.name} - {manifest.description}</FlagPanel>
  </>
);
