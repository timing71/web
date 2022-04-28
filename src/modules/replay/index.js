import { useEffect, useState } from "react";

import { createReplay } from './replay';

export const ReplayProvider = ({ replayFile }) => {

  const [replay, setReplay] = useState(null);

  useEffect(
    () => {
      createReplay(replayFile).then(setReplay);
    },
    [replayFile]
  );

  return <p>Soon™</p>;
};
