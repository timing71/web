import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "styled-components";
import { Page } from "../components/Page";
import { Theme } from "../theme";
import { SettingsProvider } from '../modules/settings';

export const ThemeDecorator = (Story) => (
  <ThemeProvider theme={Theme}>
    <Page>
      <Story />
    </Page>
  </ThemeProvider>
);

export const HelmetDecorator = (Story) => (
  <HelmetProvider>
    <Story />
  </HelmetProvider>
);

export const SettingsDecorator = (Story) => (
  <SettingsProvider>
    <Story />
  </SettingsProvider>
);
