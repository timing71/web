import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Button } from "../components/Button";

import { useFileContext } from "../components/FileLoaderContext";
import { Menu, MenuBar, MenuSeparator, ViewSettings } from "../modules/menu";
import { BackMenuItem } from "../modules/menu/components/BackMenuItem";
import { PlaybackControls, ReplayProvider } from "../modules/replay";
import { RateControls } from "../modules/replay/components/RateControls";
import { useReplayState } from "../modules/replay/state";
import { TimingScreen } from "../modules/timingScreen";


export const Replay = () => {

  const { clearFile, file } = useFileContext();
  const history = useHistory();

  const replayState = useReplayState();

  useEffect(
    () => () => {
      if (file) {
        window.URL.revokeObjectURL(file);
        clearFile();
      }
    },
    [clearFile, file]
  );

  if (!file) {
    return (
      <div>
        <p>No file selected</p>
        <Button onClick={history.goBack}>
          Back
        </Button>
      </div>
    );
  }
  else {
    return (
      <ReplayProvider
        replayFile={file}
        replayState={replayState}
        reset={() => { history.goBack(); clearFile(); }}
      >
        <TimingScreen>
          <MenuBar>
            <PlaybackControls replayState={replayState} />
            <Menu>
              <RateControls replayState={replayState} />
              <MenuSeparator />
              <ViewSettings />
              <MenuSeparator />
              <BackMenuItem />
            </Menu>
          </MenuBar>
        </TimingScreen>
      </ReplayProvider>
    );
  }

};
