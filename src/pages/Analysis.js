import { createAnalyser } from '@timing71/common/analysis';
import { applyPatch, applySnapshot } from 'mobx-state-tree';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBroadcastChannel } from '../broadcastChannel';
import { AnalysisButton } from '../components/GeneratorButton';
import { LoadingScreen } from '../components/LoadingScreen';
import { useConnectionService } from '../ConnectionServiceProvider';
import { AnalysisScreen } from '../modules/analysis';
import { useSetting } from '../modules/settings';
import styled from 'styled-components';

const DelayNote = styled.small`
  padding: 0.25em;
  text-align: center;
`;

const DownloadAnalysisButton = styled(AnalysisButton)`
  margin: 0.5em;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Analysis = ({ match: { params: { serviceUUID } } }) => {
  const cs = useConnectionService();

  const [manifest, setManifest] = useState();

  const { data: channelData } = useBroadcastChannel(`analysis/${serviceUUID}`);

  const analyser = useRef(createAnalyser(undefined, true));
  const initialised = useRef(false);

  const [delay] = useSetting('delay');

  const maybeDelay = useCallback(
    (fn) => {
    if (delay > 0) {
      setTimeout(fn, delay * 1000);
    }
    else {
      fn();
    }
  },
  [delay]
);

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
            maybeDelay(
              () => {
                applySnapshot(
                  analyser.current,
                  msg.analysis.state
                );
                initialised.current = true;
              }
            );
          }
        }
      );

    },
    [cs, maybeDelay, serviceUUID]
  );

  useEffect(
    () => {
      if (channelData && analyser.current) {
        if (channelData.type === 'ANALYSIS_STATE') {
          maybeDelay(
            ()  => {
              applySnapshot(
                analyser.current,
                channelData.data
              );
              initialised.current = true;
            }
          );
        }
        else if (channelData.type === 'ANALYSIS_DELTA') {
          maybeDelay(
            () => {
              if (initialised.current) {
                applyPatch(
                  analyser.current,
                  channelData.data
                );
              }
            }
          );
        }
      }
    },
    [channelData, maybeDelay]
  );

  if (analyser.current && manifest && initialised.current) {
    if (process.env.NODE_ENV === 'development') {
      window._analyser = analyser.current;
    }
    return (
      <AnalysisScreen
        analyser={analyser.current}
        manifest={manifest}
      >
        <Container>
          {
            delay > 0 && (
              <DelayNote>
                Delayed by {delay} seconds to match timing screen
              </DelayNote>
            )
          }
          <DownloadAnalysisButton
            label='Download analysis'
            uuid={serviceUUID}
          />
          {
            process.env.NODE_ENV === 'development' && <div>[DEV]</div>
          }
        </Container>
      </AnalysisScreen>
    );
  }
  else {
    return (
      <LoadingScreen message='Loading data...' />
    );
  }
};

export default Analysis;
