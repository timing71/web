import { createContext, useCallback, useContext, useState } from "react";

const DEFAULT_SETTINGS = {
  backgrounds: true,
  delay: 0
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const updateSettings = useCallback(
    (newSettings) => setSettings(
      oldSettings => ({ ...oldSettings, ...newSettings })
    ),
    []
  );

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      { children }
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

export const useSetting = (key) => {
  const { settings, updateSettings } = useSettings();

  return [
    settings[key],
    value => updateSettings({ [key]: value })
  ];
};
