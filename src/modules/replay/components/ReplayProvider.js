import { loadReplayFromFile } from '@timing71/common';

import { useCallback, useEffect, useRef, useState } from 'react';
import throttle from 'lodash.throttle';

import { Button } from "../../../components/Button";
import { ErrorScreen } from "../../../components/ErrorScreen";

import { LoadingScreen } from '../../../components/LoadingScreen';
import { ServiceManifestContext, ServiceStateContext } from "../../../components/ServiceContext";
import { useConnectionService } from '../../../ConnectionServiceProvider';
import { SavedPositionScreen } from './SavedPositionScreen';

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

const States = {
  LOADING: 1,
  HAS_SAVED_POSITION: 2,
  LOADED: 3,
  ERROR: 4
};

export const ReplayProvider = ({ children, replayFile, replayState, reset }) => {
  const { setDuration, setPosition, tick, state } = replayState;

  const [replay, setReplay] = useState(null);
  const [error, setError] = useState(null);

  const [currentFrame, setCurrentFrame] = useState(null);
  const [currentState, setCurrentState] = useState(States.LOADING);

  const connectionService = useConnectionService();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const storePosition = useCallback(
    throttle(
      (uuid, position) => {
        connectionService.send({
          type: 'STORE_REPLAY_POSITION',
          uuid,
          position
        });
      },
      1000
    ),
    [connectionService]
  );

  useEffect(
    () => {
      loadReplayFromFile(replayFile).then(
        r => {
          setReplay(r);
          setDuration(r.manifest.duration);

          connectionService.send({
            type: 'GET_REPLAY_POSITION',
            uuid: r.manifest.uuid
          }).then(
            (storedPosition) => {
              if (!storedPosition.position || storedPosition.position >= r.manifest.duration) {
                setCurrentState(States.LOADED);
              }
              else {
                setPosition(storedPosition.position);
                setCurrentState(States.HAS_SAVED_POSITION);
              }
            }
          );
        }
      ).catch(
        (e) => {
          setError(e);
          setCurrentState(States.ERROR);
        }
      );
    },
    [connectionService, replayFile, setDuration, setPosition]
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
          f => {
            setCurrentFrame({
              ...f,
              manifest: replay.manifest,
              session: {
                ...f.session,
                pauseClocks: f.session?.pauseClocks || !state.playing
              }
            });
            storePosition(replay.manifest.uuid, position);
          }
        ).catch(
          e => {
            if (!e.cancelled) {
              throw e;
            }
          }
        );
      }
    },
    [replay, position, state.playing, storePosition]
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

  if (currentState === States.LOADING) {
    return (
      <LoadingScreen
        message='Loading replay...'
      />
    );
  }

  if (currentState === States.ERROR) {
    return (
      <ErrorScreen error={error}>
        <p>
          The file you have selected is not a valid Timing71 replay file.
        </p>
        <Button onClick={reset}>Go back</Button>
      </ErrorScreen>
    );
  }

  if (currentState === States.HAS_SAVED_POSITION) {
    return (
      <SavedPositionScreen
        close={() => setCurrentState(States.LOADED)}
        replay={replay}
        replayState={replayState}
      />
    );
  }

  if (currentState === States.LOADED) {
    return (
      <ServiceManifestContext.Provider value={{ manifest: replay.manifest }}>
        <ServiceStateContext.Provider value={{ state: currentFrame }}>
          { children }
        </ServiceStateContext.Provider>
      </ServiceManifestContext.Provider>
    );
  }

  return (
    <p>An error occurred</p>
  );

};
