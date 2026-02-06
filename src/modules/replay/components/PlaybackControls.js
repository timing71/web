import { timeWithHours } from "@timing71/common";
import styled from "styled-components";

import { PlayPauseButton } from "./PlayPauseButton";
import { SkipBackwards, SkipForwards } from "./SkipButton";
import { TimeSlider } from './TimeSlider';

const Container = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
`;

export const PlaybackControls = ({ replayState }) => (
  <Container>
    <SkipBackwards replayState={replayState} />
    <PlayPauseButton replayState={replayState} />
    <SkipForwards replayState={replayState} />
    <div>
      { timeWithHours(replayState.state.position) }
    </div>
    <TimeSlider
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
