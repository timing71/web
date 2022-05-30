import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;

  & > label {
    flex-grow: 1;
  }

`;

const ButtonContainer = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: stretch;

  & > button {
    flex-grow: 1;

    border-right-width: 0;

    &:first-child {
      border-radius: 0.25em 0 0 0.25em;
    }

    &:last-child {
      border-radius: 0 0.25em 0.25em 0;
      border-right-width: 1px;
    }
  }
`;

const ButtonInner = styled.button`
  background-color: ${ props => props.active ? props.theme.site.highlightColor : 'transparent' };
  border: 1px solid ${ props => props.theme.site.highlightColor };
  color: ${ props => props.active ? 'black' : props.theme.site.highlightColor };

  cursor: pointer;

  padding: 0.5em;

  transition-property: background-color, color;
  transition-duration: 0.25s;

  &:hover {
    background-color: ${ props => props.theme.site.highlightColor };
    color: black;
  }
`;

const RateButton = ({ currentRate, rate, setRate }) => (
  <ButtonInner
    active={currentRate === rate}
    onClick={() => setRate(rate)}
  >
    {rate}x
  </ButtonInner>
);

export const RateControls = ({ replayState: { setRate, state: { rate } } }) => {
  return (
    <Container>
      <label>Playback speed</label>
      <ButtonContainer>
        <RateButton
          currentRate={rate}
          rate={1}
          setRate={setRate}
        />
        <RateButton
          currentRate={rate}
          rate={1.5}
          setRate={setRate}
        />
        <RateButton
          currentRate={rate}
          rate={2}
          setRate={setRate}
        />
      </ButtonContainer>
    </Container>
  );
};
