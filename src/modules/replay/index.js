import { useEffect, useState } from "react";

import { LoadingScreen } from '../../components/LoadingScreen';
import { ServiceManifestContext, ServiceStateContext } from "../../components/ServiceContext";
import { createReplay } from './replay';

export const ReplayProvider = ({ children, replayFile }) => {

  const [replay, setReplay] = useState(null);

  const [position, setPosition] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(null);

  useEffect(
    () => {
      createReplay(replayFile).then(setReplay);
    },
    [replayFile]
  );

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
