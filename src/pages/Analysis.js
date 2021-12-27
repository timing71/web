import { applyPatch, applySnapshot } from 'mobx-state-tree';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { useBroadcastChannel } from '../broadcastChannel';
import { createAnalyser } from '../modules/analysis';

export const Analysis = () => {
  const { serviceUUID } = useParams();

  const { data: channelData } = useBroadcastChannel(`analysis/${serviceUUID}`);

  const analyser = useRef(createAnalyser());
  const initialised = useRef(false);

  useEffect(
    () => {
      if (channelData && analyser.current) {
        if (channelData.type === 'ANALYSIS_STATE') {
          applySnapshot(
            analyser.current,
            channelData.data
          );
          initialised.current = true;
        }
        else if (channelData.type === 'ANALYSIS_DELTA' && initialised.current) {
          applyPatch(
            analyser.current,
            channelData.data
          );
        }
      }
    },
    [channelData]
  );

  return (
    <div>Soon...™</div>
  );
};
