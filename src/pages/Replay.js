import { useEffect, useState } from "react";
import { FileLoader } from "../components/FileLoader";
import { Menu, MenuBar, Spacer, SystemMessage, UpdateTime } from "../modules/menu";
import { ReplayProvider } from "../modules/replay";
import { TimingScreen } from "../modules/timingScreen";


export const Replay = () => {
  const [replayFile, setReplayFile] = useState(null);

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
      >
        <TimingScreen>
          <MenuBar>
            <UpdateTime />
            <Spacer />
            <SystemMessage />
            <Menu />
          </MenuBar>
        </TimingScreen>
      </ReplayProvider>
    );
  }

};
