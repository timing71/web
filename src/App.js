import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'styled-components';

import { PluginDetector } from './modules/pluginBridge';

import { Analysis } from './pages/Analysis';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Start } from './pages/Start';
import { Timing } from './pages/Timing';
import { SettingsProvider } from './modules/settings';
import { ThemeSettingsProvider } from './components/ThemeSettingsProvider';
import { Theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={Theme}>
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
              <SettingsProvider>
                <ThemeSettingsProvider>
                  <Switch>
                    <Route
                      component={Services}
                      path='/services'
                    />
                    <Route
                      component={Start}
                      path='/start'
                    />
                    <Route
                      component={Timing}
                      path='/timing/:serviceUUID'
                    />
                    <Route
                      component={Analysis}
                      path='/analysis/:serviceUUID'
                    />
                  </Switch>
                </ThemeSettingsProvider>
              </SettingsProvider>
            </PluginDetector>
          </Switch>
        </BrowserRouter>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
