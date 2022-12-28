import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getProperty, setProperty } from 'dot-prop';

import { useConnectionService } from "../../ConnectionServiceProvider";

export const DEFAULT_SETTINGS = {
  animation: true,
  backgrounds: true,
  delay: 0
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const cs = useConnectionService();

  useEffect(
    () => {
      cs.send({ type: 'RETRIEVE_SETTINGS' }).then(
        ({ settings }) => {
          setSettings({ ...DEFAULT_SETTINGS, ...settings });
        }
      );
    },
    [cs]
  );

  const updateSettings = useCallback(
    (newSettings) => {
      setSettings(
        oldSettings => {
          const saveableSettings = { ...oldSettings };

          Object.entries(newSettings).forEach(
            ([key, val]) => {
              setProperty(saveableSettings, key, val);
            }
          );

          cs.send({ type: 'STORE_SETTINGS', settings: saveableSettings });
          return saveableSettings;
        }
      );
    },
    [cs]
  );

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      { children }
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

export const useSetting = (key, defaultValue) => {
  const settingsObj = useSettings();

  if (!settingsObj) {
    return [defaultValue, () => {}];
  }

  const { settings, updateSettings } = settingsObj;

  return [
    getProperty(settings, key, defaultValue),
    value => updateSettings({ [key]: value })
  ];
};
