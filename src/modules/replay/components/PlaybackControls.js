import { timeWithHours } from "@timing71/common";
import styled from "styled-components";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { PlayPauseButton } from "./PlayPauseButton";
import { SkipBackwards, SkipForwards } from "./SkipButton";

const Container = styled.div`

  flex-grow: 1;

  display: flex;
  align-items: center;

  .rc-slider {
    margin: 0 0.5em;
  }

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

export const PlaybackControls = ({ replayState }) => (
  <Container>
    <SkipBackwards replayState={replayState} />
    <PlayPauseButton replayState={replayState} />
    <SkipForwards replayState={replayState} />
    <div>
      { timeWithHours(replayState.state.position) }
    </div>
    <Slider
      max={replayState.state.duration}
      min={0}
      onChange={replayState.setPosition}
      value={replayState.state.position}
    />
    <div>
      { timeWithHours(replayState.state.duration) }
    </div>
  </Container>
);
