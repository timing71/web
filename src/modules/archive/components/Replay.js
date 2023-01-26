import { dayjs, timeWithHours } from '@timing71/common';
import { useMenuState } from "reakit/Menu";
import { Download, OndemandVideo, StackedBarChart } from "styled-icons/material";

import { MenuButton, MenuButtonItem } from '../../../components/Button';
import { API_ROOT } from "../api";
import { useCallback, useState } from "react";
import { Logo } from "../../../components/Logo";
import { useFileContext } from "../../../components/FileLoaderContext";
import { useHistory } from "react-router";
import { BottomRow, Description, Duration, Inner, Series, Syndicate, TopRow } from '../../../components/ServiceCard';

const Loading = () => (
  <Logo
    $spin
    size='1.2em'
  />
);

const FileButton = ({ caption, disabled, downloadURL, viewIcon, viewPath }) => {
  const menuState = useMenuState({
    placement: 'bottom-start'
  });

  const ViewIcon = viewIcon;

  const [loading, setLoading] = useState(false);

  const { setFile } = useFileContext();
  const history = useHistory();

  const viewNow = useCallback(
    () => {
      setLoading(true);
      fetch(downloadURL).then(
        (response) => {
          response.blob().then(
            blob => {
              setFile(blob);
              history.push(viewPath);
            }
          );
        }
      );
    },
    [downloadURL, history, setFile, viewPath]
  );

  const download = useCallback(
    () => {
      window.location.href = downloadURL;
    },
    [downloadURL]
  );

  return (
    <MenuButton
      caption={loading ? '' : caption}
      disabled={loading || disabled}
      icon={ loading ? <Loading /> : null }
      menuState={menuState}
      onClick={viewNow}
    >
      <MenuButtonItem onClick={viewNow}>
        <ViewIcon size={24} />
        View now
      </MenuButtonItem>
      <MenuButtonItem onClick={download}>
        <Download size={24} />
        Download
      </MenuButtonItem>
    </MenuButton>
  );
};

const ReplayButton = ({ id }) => (
  <FileButton
    caption='Replay'
    downloadURL={`${API_ROOT}/download/${id}`}
    viewIcon={OndemandVideo}
    viewPath='/replay'
  />
);

const AnalysisButton = ({ disabled, id }) => (
  <FileButton
    caption='Analysis'
    disabled={disabled}
    downloadURL={`${API_ROOT}/analysis/${id}`}
    viewIcon={StackedBarChart}
    viewPath='/file-analysis'
  />
);

export const Replay = ({ replay }) => {
  return (
    <Inner
      data-id={replay.id}
      syndicated={!!replay.syndicateName}
    >
      <TopRow>
        <Series>{replay.series}</Series>
        {
          replay.syndicateName && (
            <Syndicate
              name={replay.syndicateName}
              url={replay.syndicateURL}
            />
          )
        }
      </TopRow>
      <Description>
        {replay.description}
      </Description>
      <BottomRow>
        <Duration>
          {dayjs(replay.startTime * 1000).format('D MMM YYYY')}
        </Duration>
        <ReplayButton id={replay.id} />
        <AnalysisButton
          disabled={!replay.analysisFilename}
          id={replay.id}
        />
        <Duration>
          { timeWithHours(replay.duration) }
        </Duration>
      </BottomRow>
    </Inner>
  );
};
