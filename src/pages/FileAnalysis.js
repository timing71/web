import { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';

import { Page } from "../components/Page";
import { LoadingScreen } from '../components/LoadingScreen';
import { createAnalyser } from '../modules/analysis';
import { AnalysisScreen } from '../modules/analysis/components/AnalysisScreen';

const LoadState = {
  UNLOADED: 1,
  LOADING: 2,
  LOADED: 3,
  ERROR: 4
};

const FileChooser = styled.input.attrs({
  accept: '.json,application/json',
  type: 'file'
})``;

const LoadFilePage = ({ loadFile }) => (
  <Page>
    <h2>Select file</h2>
    <FileChooser
      onChange={(e) => loadFile(e.target.files[0])}
    />
  </Page>
);

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
      <LoadFilePage
        loadFile={startLoading}
      />
    );
  }
};
