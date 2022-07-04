import { useMemo, useReducer } from "react";

const INITIAL_STATE = {
  duration: 0,
  playing: false,
  position: 0,
  prevTick: 0,
  rate: 1
};

const actionTypes = {
  PAUSE: 'pause',
  PLAY: 'play',
  SET_DURATION: 'setDuration',
  SET_POSITION: 'setPosition',
  SET_RATE: 'setRate',
  TICK: 'tick'
};

const createActions = (dispatch) => ({
  pause: () => dispatch({ type: actionTypes.PAUSE }),
  play: () => dispatch({ type: actionTypes.PLAY }),
  setDuration: (duration) => dispatch({ type: actionTypes.SET_DURATION, duration }),
  setPosition: (position) => dispatch({ type: actionTypes.SET_POSITION, position }),
  setRate: (rate) => dispatch({ type: actionTypes.SET_RATE, rate }),
  tick: () => dispatch({ type: actionTypes.TICK })
});

export const useReplayState = () => {

  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {

        case actionTypes.PAUSE: {
          return {
            ...prevState,
            playing: false
          };
        }

        case actionTypes.PLAY:

          if (prevState.playing) {
            return prevState;
          }

          return {
            ...prevState,
            playing: true,
            prevTick: Date.now()
          };

        case actionTypes.SET_DURATION:
          return {
            ...prevState,
            duration: action.duration
          };

        case actionTypes.SET_POSITION:
          return {
            ...prevState,
            position: Math.min(action.position, prevState.duration)
          };

        case actionTypes.SET_RATE:
          return {
            ...prevState,
            rate: action.rate
          };

        case actionTypes.TICK:
          const delta = Date.now() - prevState.prevTick;

          const nextPos = prevState.position + (prevState.rate * delta / 1000);
          const nextPlaying = nextPos < prevState.duration;

          return {
            ...prevState,
            position: Math.min(nextPos, prevState.duration),
            prevTick: Date.now(),
            playing: nextPlaying
          };

        default:
          return prevState;
      }
    },
    { ...INITIAL_STATE }
  );

  const actions = useMemo(
    () => createActions(dispatch),
    [dispatch]
  );

  return {
    ...actions,
    state
  };
};
