import { useCallback } from 'react';

import { SkipNext, SkipPrevious } from '@styled-icons/material-sharp';
import { ControlButton } from './ControlButton';

const cancelDoubleClick = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const SkipButton = ({ amount, icon, replayState, title }) => {
  const Icon = icon;

  const skip = useCallback(
    (e) => {
      replayState.setPosition(replayState.state.position + amount);
      e.preventDefault();
      e.stopPropagation();
    },
    [amount, replayState]
  );

  return (
    <ControlButton
      onClick={skip}
      onDoubleClick={cancelDoubleClick}
      title={title}
    >
      <Icon size={24} />
    </ControlButton>
  );
};

export const SkipForwards = ({ replayState }) => (
  <SkipButton
    amount={60}
    icon={SkipNext}
    replayState={replayState}
    title='Forward 60 seconds'
  />
);

export const SkipBackwards = ({ replayState }) => (
  <SkipButton
    amount={-60}
    icon={SkipPrevious}
    replayState={replayState}
    title='Back 60 seconds'
  />
);
