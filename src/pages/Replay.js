import { useEffect, useState } from "react";
import { FileLoader } from "../components/FileLoader";
import { ReplayProvider } from "../modules/replay";


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
      />
    );
  }

};
