import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "styled-components";
import { Page } from "../components/Page";
import { Theme } from "../theme";

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
