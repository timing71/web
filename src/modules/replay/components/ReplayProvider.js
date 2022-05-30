import { useEffect, useRef, useState } from "react";

import { LoadingScreen } from '../../../components/LoadingScreen';
import { ServiceManifestContext, ServiceStateContext } from "../../../components/ServiceContext";
import { createReplay } from '../replay';

const cancellable = promise => {
  let rejectFn;

  const wrappedPromise = new Promise((resolve, reject) => {
    rejectFn = reject;

    Promise.resolve(promise)
      .then(resolve)
      .catch(reject);
  });

  wrappedPromise.cancel = () => {
    rejectFn({ cancelled: true });
  };

  return wrappedPromise;
};

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

  const prevSeek = useRef();

  useEffect(
    () => {
      if (replay) {
        if (prevSeek.current) {
          prevSeek.current.cancel();
        }

        const seek = cancellable(replay.getStateAtRelative(position));
        prevSeek.current = seek;
        seek.then(setCurrentFrame).catch(
          e => {
            if (!e.cancelled) {
              throw e;
            }
          }
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
