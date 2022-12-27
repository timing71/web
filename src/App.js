import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from 'styled-components';

import { PluginDetector } from './modules/pluginBridge';

import { FAQ } from './pages/FAQ';
import { FileLoaderContextProvider } from './components/FileLoaderContext';
import { Home } from './pages/Home';
import { MainMenu } from './pages/MainMenu';
import { Services } from './pages/Services';
import { SettingsProvider } from './modules/settings';
import { Start } from './pages/Start';
import { Timing } from './pages/Timing';
import { ThemeSettingsProvider } from './components/ThemeSettingsProvider';
import { Theme } from './theme';
import { LoadingScreen } from './components/LoadingScreen';
import { AutobahnProvider } from './modules/autobahn';

const Analysis = lazy(() => import('./pages/Analysis'));
const FileAnalysis = lazy(() => import('./pages/FileAnalysis'));
const Replay = lazy(() => import('./pages/Replay'));

function App() {
  return (
    <ThemeProvider theme={Theme}>
      <HelmetProvider>
        <Helmet
          defaultTitle='Timing71'
          titleTemplate='%s — Timing71'
        />
        <AutobahnProvider>
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
                      <Suspense fallback={<LoadingScreen />}>
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
                      </Suspense>
                    </FileLoaderContextProvider>
                  </ThemeSettingsProvider>
                </SettingsProvider>
              </PluginDetector>
            </Switch>
          </BrowserRouter>
        </AutobahnProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
