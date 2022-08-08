import { useCallback, useEffect, useState } from "react";
import { Download } from "styled-icons/material";
import { useConnectionService } from "../ConnectionServiceProvider";
import { Button } from "./Button";

const GeneratorButton = ({ children, finishMessage, progressMessage, startMessage, uuid }) => {

  const [isGenerating, setGenerating] = useState(false);
  const cs = useConnectionService();
  const [progress, setProgress] = useState(null);

  useEffect(
    () => {
      const handleMessage = (message) => {
        if (message?.uuid === uuid) {
          if (message.type === finishMessage) {
            setGenerating(false);
          }
          else if (message.type === progressMessage) {
            setProgress(message.progress);
          }
        }
      };

      cs.on('message', handleMessage);

      return () => {
        cs.removeListener('message', handleMessage);
      };
    },
    [cs, finishMessage, progressMessage, uuid]
  );

  const startGeneration = useCallback(
    () => {
      cs.send({ type: startMessage, uuid }).then(
        () => setGenerating(true)
      );
    },
    [cs, startMessage, uuid]
  );


  return (
    <Button
      disabled={isGenerating}
      onClick={startGeneration}
    >
      {
        isGenerating ? 'Generating...' : children
      }
      {
        isGenerating && progress !== null ? ` (${progress.percent}%)`: null
      }
    </Button>
  );
};

export const ReplayButton = ({ uuid }) => (
  <GeneratorButton
    finishMessage='REPLAY_GENERATION_FINISHED'
    progressMessage='REPLAY_GENERATION_PROGRESS'
    startMessage='GENERATE_SERVICE_REPLAY'
    uuid={uuid}
  >
    <Download size={24} /> Replay
  </GeneratorButton>
);

export const AnalysisButton = ({ label='Analysis', uuid }) => (
  <GeneratorButton
    finishMessage='ANALYSIS_GENERATION_FINISHED'
    startMessage='GENERATE_ANALYSIS_DOWNLOAD'
    uuid={uuid}
  >
    <Download size={24} /> { label }
  </GeneratorButton>
);
