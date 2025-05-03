import { MagnifyingGlass, CircleXmark } from 'styled-icons/fa-solid';
import { useFocusedCarContext } from '../../timingScreen/context';
import styled from 'styled-components';

const Wrapper = styled.div`
  cursor: pointer;
`;

const Inner = styled.span`
  background-color: ${ props => props.theme.site.highlightColor };
  color: black;
  border-radius: 0.5em;
  padding-left: 0.5em;
`;

export const FocusedCarIndicator = () => {

  const { focusedCarNum, setFocusedCarNum } = useFocusedCarContext();

  if (!focusedCarNum) {
    return null;
  }

  return (
    <Wrapper
      onClick={() => setFocusedCarNum(null)}
      title={`Focused on car ${focusedCarNum} - click to cancel`}
    >
      <MagnifyingGlass size={16} />
      <Inner>
        Car {focusedCarNum}
        <CircleXmark
          size={12}
          style={{ marginLeft: '0.25rem' }}
        />
      </Inner>
    </Wrapper>
  );
};
