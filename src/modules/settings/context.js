import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getProperty, setProperty } from 'dot-prop';

const LOCAL_STORAGE_KEY = 'timing71Settings';

export const DEFAULT_SETTINGS = {
  animation: true,
  backgrounds: true,
  delay: 0
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(
    () => {
      if (typeof(localStorage) !== 'undefined') {
        const restoredSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
        setSettings({ ...DEFAULT_SETTINGS, ...restoredSettings });
      }
    },
    []
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

          localStorage.setItem(LOCAL_STORAGE_KEY, saveableSettings);
          return saveableSettings;
        }
      );
    },
    []
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
