import { useEffect, useState } from "react";
import { Translator } from "./translate";
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

  const [filteredCollections, setFilteredCollections] = useState({});
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(
    () => {
      if (sessionID && server) {
        const mySubs = SESSION_SUBSCRIPTIONS.map(
          ss => server.sub(ss, [new oid(sessionID)])
        );

        setCurrentSession(server.collection('sessions').filter(s => s._id === sessionID).fetch()[0]);

        return () => {
          mySubs.forEach(
            s => s.stop()
          );
        };
      }
    },
    [server, sessionID, sessionInfo]
  );

  useEffect(
    // Only pass on data relevant to current session to Translator.
    () => {
      const myFilteredCollections = {};
      Object.entries(collections).forEach(
        ([key, values]) => {
          values.forEach(
            v => {
              if (v.session?.value === sessionID) {
                const relevantKey = Object.keys(v).filter(k => k !== '_id' && k !== 'session')[0];
                myFilteredCollections[key] = v[relevantKey];
              }
            }
          );
        }
      );
      setFilteredCollections(myFilteredCollections);
    },
    [collections, sessionID, setFilteredCollections]
  );

  return (
    <Translator
      collections={filteredCollections}
      session={currentSession}
      updateManifest={updateManifest}
      updateState={updateState}
    />
  );

};

export const Session = ({ collections, server, updateManifest, updateState }) => {
  const { session_info } = collections;

  const [currentSessionID, setCurrentSessionID] = useState();
  const [currentSessionInfo, setCurrentSessionInfo] = useState();

  useEffect(
    () => {
      if (session_info) {
        let newCurrentSession = session_info.find(s => !s.info?.closed);

        if (!newCurrentSession) {
          newCurrentSession = session_info.slice(-1)[0];
        }

        if (
          newCurrentSession !== currentSessionInfo ||
          newCurrentSession?.session?.value !== currentSessionID
        ) {
          setCurrentSessionInfo(newCurrentSession);
          setCurrentSessionID(newCurrentSession?.session?.value);
        }

      }

    },
    [currentSessionID, currentSessionInfo, server, session_info]
  );

  return (
    <CurrentSessionMonitor
      collections={collections}
      server={server}
      sessionID={currentSessionID}
      sessionInfo={currentSessionInfo}
      updateManifest={updateManifest}
      updateState={updateState}
    />
  );
};
