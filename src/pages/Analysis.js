import { applyPatch, applySnapshot } from 'mobx-state-tree';
import { useContext, useEffect, useRef, useState } from 'react';
import { useBroadcastChannel } from '../broadcastChannel';
import { LoadingScreen } from '../components/LoadingScreen';
import { createAnalyser } from '../modules/analysis';
import { AnalysisScreen } from '../modules/analysis/components/AnalysisScreen';
import { PluginContext } from '../modules/pluginBridge';

export const Analysis = ({ match: { params: { serviceUUID } } }) => {
  const port = useContext(PluginContext);

  const [manifest, setManifest] = useState();

  const { data: channelData } = useBroadcastChannel(`analysis/${serviceUUID}`);

  const analyser = useRef(createAnalyser(undefined, true));
  const initialised = useRef(false);

  useEffect(
    () => {

      port.send({
        type: 'FETCH_SERVICE',
        uuid: serviceUUID
      }).then(
        msg => {
          setManifest(msg.state.manifest);
          applySnapshot(
            analyser.current,
            msg.analysis.state
          );
          initialised.current = true;
        }
      );

    },
    [port, serviceUUID]
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
      />
    );
  }
  else {
    return (
      <LoadingScreen message='Loading data...' />
    );
  }
};
