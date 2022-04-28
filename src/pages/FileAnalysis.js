import { useCallback, useRef, useState } from 'react';

import { LoadingScreen } from '../components/LoadingScreen';
import { createAnalyser } from '../modules/analysis';
import { AnalysisScreen } from '../modules/analysis/components/AnalysisScreen';
import { FileLoader } from '../components/FileLoader';

const LoadState = {
  UNLOADED: 1,
  LOADING: 2,
  LOADED: 3,
  ERROR: 4
};

export const FileAnalysis = () => {

  const [loadState, setLoadState] = useState(LoadState.UNLOADED);
  const [data, setData] = useState();
  const analyser = useRef();

  const startLoading = useCallback(
    async (file) => {
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
    },
    []
  );

  if (loadState === LoadState.LOADED && !!data) {
    return (
      <AnalysisScreen
        analyser={analyser.current}
        manifest={data.manifest || data.service || {}}
      />
    );
  }
  else if (loadState === LoadState.LOADING) {
    return (
      <LoadingScreen message='Loading analysis...' />
    );
  }
  else {
    return (
      <FileLoader
        accept='.json,application/json'
        loadFile={startLoading}
      />
    );
  }
};
