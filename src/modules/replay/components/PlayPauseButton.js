import { PlayArrow, Pause } from "@styled-icons/material-sharp";
import { ControlButton } from "./ControlButton";

export const PlayPauseButton = ({ replayState }) => {
  const Icon = replayState.state.playing ? Pause : PlayArrow;
  const func = replayState.state.playing ? replayState.pause : replayState.play;

  return (
    <ControlButton
      onClick={func}
      title={ replayState.state.playing ? 'Pause' : 'Play' }
    >
      <Icon size={24} />
    </ControlButton>
  );
};
