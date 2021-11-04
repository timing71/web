import { ThemeProvider } from "styled-components";
import { useSettings } from "../modules/settings";
import { Theme } from "../theme";

export const ThemeSettingsProvider = ({ children }) => {
  const { settings } = useSettings();

  const themeWithSettings = {
    ...Theme,
    settings
  };

  return (
    <ThemeProvider theme={themeWithSettings}>
      { children }
    </ThemeProvider>
  );
};
