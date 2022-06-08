import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { PluginContext } from "../pluginBridge";

const DEFAULT_SETTINGS = {
  animation: true,
  backgrounds: true,
  delay: 0
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const port = useContext(PluginContext);

  useEffect(
    () => {
      port.send({ type: 'RETRIEVE_SETTINGS' }).then(
        ({ settings }) => {
          setSettings({ ...DEFAULT_SETTINGS, ...settings });
        }
      );
    },
    [port]
  );

  const updateSettings = useCallback(
    (newSettings) => {
      setSettings(
        oldSettings => {
          const saveableSettings = { ...oldSettings, ...newSettings };
          port.send({ type: 'STORE_SETTINGS', settings: saveableSettings });
          return saveableSettings;
        }
      );
    },
    [port]
  );

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      { children }
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

export const useSetting = (key, defaultValue) => {
  const { settings, updateSettings } = useSettings();

  return [
    settings[key] || defaultValue,
    value => updateSettings({ [key]: value })
  ];
};
