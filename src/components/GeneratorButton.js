import { useCallback, useEffect, useState } from "react";
import { Download } from "styled-icons/material";
import { useConnectionService } from "../ConnectionServiceProvider";
import { Button } from "./Button";

const GeneratorButton = ({ children, className, finishMessage, progressMessage, sessionIndex, startMessage, uuid }) => {

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
      cs.send({ type: startMessage, sessionIndex, uuid }).then(
        () => setGenerating(true)
      );
    },
    [cs, sessionIndex, startMessage, uuid]
  );


  return (
    <Button
      className={className}
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

export const ReplayButton = ({ sessionIndex, uuid }) => (
  <GeneratorButton
    finishMessage='REPLAY_GENERATION_FINISHED'
    progressMessage='REPLAY_GENERATION_PROGRESS'
    sessionIndex={sessionIndex}
    startMessage='GENERATE_SERVICE_REPLAY'
    uuid={uuid}
  >
    <Download size={24} /> Replay
  </GeneratorButton>
);

export const AnalysisButton = ({ className, label='Analysis', sessionIndex, uuid }) => (
  <GeneratorButton
    className={className}
    finishMessage='ANALYSIS_GENERATION_FINISHED'
    sessionIndex={sessionIndex}
    startMessage='GENERATE_ANALYSIS_DOWNLOAD'
    uuid={uuid}
  >
    <Download size={24} /> { label }
  </GeneratorButton>
);
