import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'styled-components';

import { PluginDetector } from './modules/pluginBridge';

import { Analysis } from './pages/Analysis';
import { FAQ } from './pages/FAQ';
import { FileAnalysis } from './pages/FileAnalysis';
import { FileLoaderContextProvider } from './components/FileLoaderContext';
import { Home } from './pages/Home';
import { MainMenu } from './pages/MainMenu';
import { Replay } from './pages/Replay';
import { Services } from './pages/Services';
import { SettingsProvider } from './modules/settings';
import { Start } from './pages/Start';
import { Timing } from './pages/Timing';
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
            <Route
              component={FAQ}
              path='/faq'
            />
            <PluginDetector>
              <SettingsProvider>
                <ThemeSettingsProvider>
                  <FileLoaderContextProvider>
                    <Switch>
                      <Route
                        component={MainMenu}
                        path='/menu'
                      />
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
                      <Route
                        component={FileAnalysis}
                        path='/file-analysis'
                      />
                      <Route
                        component={Replay}
                        path='/replay'
                      />
                    </Switch>
                  </FileLoaderContextProvider>
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
