import deepEqual from "deep-equal";
import { generateMessages } from "@timing71/common/messages";

export const processStateUpdate = (oldState, updatedState) => {
  const newState = { ...oldState, ...updatedState };

  const newMessages = generateMessages(newState.manifest, oldState, newState).concat(
    updatedState.extraMessages || [],
  );

  const highlight = [];
  newMessages.forEach(
    nm => {
      if (nm.length >= 5) {
        highlight.push(nm[4]);
      }
    }
  );
  newState.highlight = highlight;

  newState.messages = [
    ...newMessages,
    ...(oldState?.messages || [])
  ].slice(0, 100);

  newState.lastUpdated = Date.now();
  delete newState.extraMessages;

  return newState;
};

// Adds start time and UUID to the manifest, and if a deep equality check fails,
// calls `callback` with the new manifest.
export const processManifestUpdate = (oldManifest, newManifest, startTime, uuid, callback) => {
  const newManifestWithStartTime = {
    ...newManifest,
    startTime: startTime,
    uuid
  };

  if (!deepEqual(newManifestWithStartTime, oldManifest)) {
    callback(newManifestWithStartTime);
  }
};
