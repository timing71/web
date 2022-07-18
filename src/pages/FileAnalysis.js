import { useCallback, useEffect, useRef, useState } from 'react';

import { LoadingScreen } from '../components/LoadingScreen';
import { createAnalyser } from '../modules/analysis';
import { AnalysisScreen } from '../modules/analysis/components/AnalysisScreen';
import { useFileContext } from '../components/FileLoaderContext';
import { useHistory } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowBack } from 'styled-icons/material';
import styled from 'styled-components';

const LoadState = {
  UNLOADED: 1,
  LOADING: 2,
  LOADED: 3,
  ERROR: 4
};

const BackButton = styled(Button)`
  margin: 0 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FileAnalysis = () => {

  const [loadState, setLoadState] = useState(LoadState.UNLOADED);
  const [data, setData] = useState();
  const analyser = useRef();
  const { clearFile, file } = useFileContext();
  const history = useHistory();

  const startLoading = useCallback(
    async () => {
      if (file) {
        try {
          setLoadState(LoadState.LOADING);
          const fileUrl = window.URL.createObjectURL(file);

          const rawFile = await fetch(fileUrl);
          const json = await rawFile.json();

          analyser.current = createAnalyser(json, false);
          setData(json);
          setLoadState(LoadState.LOADED);

          window.URL.revokeObjectURL(fileUrl);
        }
        catch (e) {
          console.error(e); // eslint-disable-line no-console
          setLoadState(LoadState.ERROR);
        }
      }
    },
    [file]
  );

  useEffect(
    () => {
      startLoading();
    },
    [startLoading]
  );

  if (loadState === LoadState.LOADED && !!data) {
    return (
      <AnalysisScreen
        analyser={analyser.current}
        manifest={data.manifest || data.service || {}}
      >
        <BackButton onClick={() => { history.push('/'); clearFile(); }}>
          <ArrowBack size={24} />
          Main menu
        </BackButton>
      </AnalysisScreen>
    );
  }
  else if (loadState === LoadState.LOADING) {
    return (
      <LoadingScreen message='Loading analysis...' />
    );
  }
  else {
    return null;
  }
};
