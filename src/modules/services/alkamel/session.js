import { useEffect } from "react";
import { useState } from "react/cjs/react.development";
import { oid } from "./types";

const SESSION_SUBSCRIPTIONS = [
    'entry',
    'trackInfo',
    'standings',
    'sessionStatus',
    'weather',
    'bestResults',
    'raceControl',
    'sessionBestResultsByClass'
];

const CurrentSessionMonitor = ({ collections, sessionID, sessionInfo, server, updateManifest, updateState }) => {

  useEffect(
    () => {
      if (sessionID && server) {
        const mySubs = SESSION_SUBSCRIPTIONS.map(
          ss => server.sub(ss, [new oid(sessionID)])
        );

        const currentSession = server.collection('sessions').filter(s => s._id === sessionID).fetch()[0];

        console.log(`Series: ${sessionInfo.info?.champName}`);
        console.log(`Session: ${sessionInfo.info?.eventName} - ${currentSession?.name}`);

        return () => {
          mySubs.forEach(
            s => s.stop()
          );
        };
      }
    },
    [server, sessionID, sessionInfo]
  );

  return null;

};

export const Session = ({ collections: { session_info }, server, updateManifest, updateState }) => {

  const [currentSessionID, setCurrentSessionID] = useState();
  const [currentSessionInfo, setCurrentSessionInfo] = useState();

  useEffect(
    () => {
      if (session_info) {
        let newCurrentSession = session_info.find(s => !s.info?.closed);

        if (!newCurrentSession) {
          newCurrentSession = session_info.slice(-1)[0];
        }

        setCurrentSessionInfo(newCurrentSession);
        setCurrentSessionID(newCurrentSession?.session?.value);
      }

    },
    [server, session_info]
  );

  return (
    <CurrentSessionMonitor
      server={server}
      sessionID={currentSessionID}
      sessionInfo={currentSessionInfo}
    />
  );
};
