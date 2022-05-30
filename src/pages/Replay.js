import { useEffect, useState } from "react";
import { FileLoader } from "../components/FileLoader";
import { Menu, MenuBar, MenuSeparator, ViewSettings } from "../modules/menu";
import { PlaybackControls, ReplayProvider } from "../modules/replay";
import { RateControls } from "../modules/replay/components/RateControls";
import { useReplayState } from "../modules/replay/state";
import { TimingScreen } from "../modules/timingScreen";


export const Replay = () => {
  const [replayFile, setReplayFile] = useState(null);

  const replayState = useReplayState();

  useEffect(
    () => () => {
      if (replayFile) {
        window.URL.revokeObjectURL(replayFile);
      }
    },
    [replayFile]
  );

  if (!replayFile) {
    return (
      <FileLoader
        accept='.zip,application/zip'
        loadFile={setReplayFile}
      />
    );
  }
  else {
    return (
      <ReplayProvider
        replayFile={replayFile}
        replayState={replayState}
      >
        <TimingScreen>
          <MenuBar>
            <PlaybackControls replayState={replayState} />
            <Menu>
              <RateControls replayState={replayState} />
              <MenuSeparator />
              <ViewSettings />
            </Menu>
          </MenuBar>
        </TimingScreen>
      </ReplayProvider>
    );
  }

};
