import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import styled from 'styled-components';

const Wrapper = styled.div`
  flex-grow: 1;
  margin: 0 0.5em;

  .rc-slider-track {
    background-color: ${ props => props.theme.site.highlightColor };
  }

  .rc-slider-rail {
    background-color: #808080;
  }

  .rc-slider-handle {
    background-color: ${ props => props.theme.site.highlightColor };
    border-color: ${ props => props.theme.site.highlightColor };
    cursor: pointer;

    &:hover {
      background-color: white;
      border-color: white;
    }
  }
`;

export const TimeSlider = ({ className, max, min, onChange, value }) => {
  return (
    <Wrapper className={className}>
      <Slider
        max={max}
        min={min}
        onChange={onChange}
        value={value}
      />
    </Wrapper>
  );
};
