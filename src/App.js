import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import { PluginDetector } from './modules/pluginBridge';

import { Home } from './pages/Home';
import { Start } from './pages/Start';
import { Timing } from './pages/Timing';
import { Theme } from './theme';
import { SettingsProvider } from './modules/settings';

function App() {
  return (
    <ThemeProvider theme={Theme}>
      <SettingsProvider>
        <HelmetProvider>
          <Helmet
            defaultTitle='Timing71 Beta'
            titleTemplate='%s — Timing71 Beta'
          />
          <BrowserRouter>
            <Switch>
              <Route
                component={Home}
                exact
                path='/'
              />
              <PluginDetector>
                <Switch>
                  <Route
                    component={Start}
                    path='/start'
                  />
                  <Route
                    component={Timing}
                    path='/timing/:serviceUUID'
                  />
                </Switch>
              </PluginDetector>
            </Switch>
          </BrowserRouter>
        </HelmetProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
