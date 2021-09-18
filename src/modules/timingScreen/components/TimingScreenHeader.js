import styled from "styled-components";

const FlagPanel = styled.div`
  grid-area: flag;
`;

export const TimingScreenHeader = ({ state: { manifest } }) => (
  <>
    <FlagPanel>{manifest.name} - {manifest.description}</FlagPanel>
  </>
);
