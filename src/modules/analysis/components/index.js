import { useRef, useEffect } from 'react';
import { createAnalyser } from '@timing71/common/analysis';
import { onPatch, onSnapshot } from 'mobx-state-tree';

import { useConnectionService } from '../../../ConnectionServiceProvider';
import { useServiceState } from '../../../components/ServiceContext';
import { useBroadcastChannel } from '../../../broadcastChannel';

export const Analysis = ({ analysisState, live=false, serviceUUID }) => {

  const cs = useConnectionService();
  const { state } = useServiceState();
  const { emit } = useBroadcastChannel(`analysis/${serviceUUID}`);

  const analyser = useRef();
  if (!analyser.current) {
    analyser.current = createAnalyser(analysisState, live);
  }
  const prevState = useRef(state);

  const latestSnapshot = useRef();

  useEffect(
    () => {
      if (analyser.current) {
        onSnapshot(
          analyser.current,
          (state) => {
            latestSnapshot.current = state;
            try {
              cs.send({
                type: 'UPDATE_SERVICE_ANALYSIS',
                analysis: state,
                uuid: serviceUUID,
                timestamp: state.lastUpdated
              });
            }
            catch (error) {
              // sometimes we end up with a disconnected port here
            }
          }
        );

        onPatch(
          analyser.current,
          (p) => {
            emit({ type: 'ANALYSIS_DELTA', data: p });
          }
        );
      }
    },
    [cs, emit, serviceUUID]
  );

  useEffect(
    () => {
      const keyframeInterval = setInterval(
        () => {
          latestSnapshot.current && emit({ type: 'ANALYSIS_STATE', data: latestSnapshot.current });
        },
        60000
      );

      return () => {
        clearInterval(keyframeInterval);
      };
    },
    [emit]
  );

  useEffect(
    () => {
      analyser.current?.updateState(
        prevState.current,
        state
      );

      prevState.current = state;
    },
    [cs, serviceUUID, state]
  );

  return null;
};

export { AnalysisScreen } from './AnalysisScreen';
