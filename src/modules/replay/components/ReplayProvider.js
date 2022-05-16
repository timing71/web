import { useEffect, useState } from "react";

import { LoadingScreen } from '../../../components/LoadingScreen';
import { ServiceManifestContext, ServiceStateContext } from "../../../components/ServiceContext";
import { createReplay } from '../replay';

export const ReplayProvider = ({ children, replayFile, replayState: { setDuration, tick, state } }) => {

  const [replay, setReplay] = useState(null);

  const [currentFrame, setCurrentFrame] = useState(null);

  useEffect(
    () => {
      createReplay(replayFile).then(
        r => {
          setReplay(r);
          setDuration(r.manifest.duration);
        }
      );
    },
    [replayFile, setDuration]
  );

  const position = state.position;

  useEffect(
    () => {
      if (replay) {
        replay.getStateAtRelative(position).then(
          setCurrentFrame
        );
      }
    },
    [replay, position]
  );

  useEffect(
    () => {
      if (state.playing) {
        const interval = setInterval(
          tick,
          500
        );

        return () => {
          clearInterval(interval);
        };
      }
    },
    [state.playing, tick]
  );

  if (!replay) {
    return (
      <LoadingScreen
        message='Loading replay...'
      />
    );
  }

  return (
    <ServiceManifestContext.Provider value={{ manifest: replay.manifest }}>
      <ServiceStateContext.Provider value={{ state: currentFrame }}>
        { children }
      </ServiceStateContext.Provider>
    </ServiceManifestContext.Provider>
  );
};
