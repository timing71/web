import { applyPatch, applySnapshot } from 'mobx-state-tree';
import { useEffect, useRef, useState } from 'react';
import { useBroadcastChannel } from '../broadcastChannel';
import { AnalysisButton } from '../components/GeneratorButton';
import { LoadingScreen } from '../components/LoadingScreen';
import { useConnectionService } from '../ConnectionServiceProvider';
import { createAnalyser } from '../modules/analysis';
import { AnalysisScreen } from '../modules/analysis/components/AnalysisScreen';

export const Analysis = ({ match: { params: { serviceUUID } } }) => {
  const cs = useConnectionService();

  const [manifest, setManifest] = useState();

  const { data: channelData } = useBroadcastChannel(`analysis/${serviceUUID}`);

  const analyser = useRef(createAnalyser(undefined, true));
  const initialised = useRef(false);

  useEffect(
    () => {

      cs.send({
        type: 'FETCH_SERVICE',
        uuid: serviceUUID
      }).then(
        msg => {
          if (msg.state?.manifest) {
            setManifest(msg.state.manifest);
          }
          if (msg.analysis?.state) {
            applySnapshot(
              analyser.current,
              msg.analysis.state
            );
            initialised.current = true;
          }
        }
      );

    },
    [cs, serviceUUID]
  );

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

  if (analyser.current && manifest) {
    return (
      <AnalysisScreen
        analyser={analyser.current}
        manifest={manifest}
      >
        <AnalysisButton
          label='Download analysis'
          uuid={serviceUUID}
        />
      </AnalysisScreen>
    );
  }
  else {
    return (
      <LoadingScreen message='Loading data...' />
    );
  }
};
