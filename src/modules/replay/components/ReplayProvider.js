import { useEffect, useRef, useState } from "react";

import { loadReplayFromFile } from '@timing71/common';

import { Button } from "../../../components/Button";
import { ErrorScreen } from "../../../components/ErrorScreen";

import { LoadingScreen } from '../../../components/LoadingScreen';
import { ServiceManifestContext, ServiceStateContext } from "../../../components/ServiceContext";

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

export const ReplayProvider = ({ children, replayFile, replayState: { setDuration, tick, state }, reset }) => {

  const [replay, setReplay] = useState(null);
  const [error, setError] = useState(null);

  const [currentFrame, setCurrentFrame] = useState(null);

  useEffect(
    () => {
      loadReplayFromFile(replayFile).then(
        r => {
          setReplay(r);
          setDuration(r.manifest.duration);
        }
      ).catch(
        setError
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
        seek.then(
          f => setCurrentFrame({ ...f, manifest: replay.manifest })
        ).catch(
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
    if (error) {
      return (
        <ErrorScreen error={error}>
          <p>
            The file you have selected is not a valid Timing71 replay file.
          </p>
          <Button onClick={reset}>Go back</Button>
        </ErrorScreen>
      );
    }
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
