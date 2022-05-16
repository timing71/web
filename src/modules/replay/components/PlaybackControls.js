import { timeWithHours } from "../../../formats";
import { PlayPauseButton } from "./PlayPauseButton";
import { SkipBackwards, SkipForwards } from "./SkipButton";

export const PlaybackControls = ({ replayState }) => (
  <>
    <SkipBackwards replayState={replayState} />
    <PlayPauseButton replayState={replayState} />
    <SkipForwards replayState={replayState} />
    <div>
      { timeWithHours(replayState.state.position) } / { timeWithHours(replayState.state.duration) }
    </div>
  </>
);
