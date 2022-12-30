import { lazy, Suspense } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { PluginDetector } from './modules/pluginBridge';

import { FAQ } from './pages/FAQ';
import { FileLoaderContextProvider } from './components/FileLoaderContext';
import { Home } from './pages/Home';
import { MainMenu } from './pages/MainMenu';
import { Services } from './pages/Services';
import { SettingsProvider } from './modules/settings';
import { Start } from './pages/Start';
import { ThemeSettingsProvider } from './components/ThemeSettingsProvider';
import { LoadingScreen } from './components/LoadingScreen';
import { AutobahnProvider } from './modules/autobahn';

const Archive = lazy(() => import(/* webpackChunkName: "archive" */ './pages/Archive'));
const Analysis = lazy(() => import(/* webpackChunkName: "analysis" */ './pages/Analysis'));
const FileAnalysis = lazy(() => import(/* webpackChunkName: "fileAnalysis" */ './pages/FileAnalysis'));
const HostedAnalysis = lazy(() => import(/* webpackChunkName: "hostedAnalysis" */ './pages/HostedAnalysis'));
const HostedTiming = lazy(() => import(/* webpackChunkName: "hostedTiming" */ './pages/HostedTiming'));
const Replay = lazy(() => import(/* webpackChunkName: "replay" */ './pages/Replay'));
const Timing = lazy(() => import(/* webpackChunkName: "timing" */ './pages/Timing'));

const queryClient = new QueryClient();

function App() {
  return (
    <SettingsProvider>
      <ThemeSettingsProvider>
        <QueryClientProvider client={queryClient}>
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
                  <Suspense fallback={<LoadingScreen />}>
                    <Route
                      component={HostedTiming}
                      path='/hosted/:uuid'
                    />
                    <Route
                      component={HostedAnalysis}
                      path='/hosted-analysis/:uuid'
                    />
                  </Suspense>
                  <PluginDetector>
                    <FileLoaderContextProvider>
                      <Suspense fallback={<LoadingScreen />}>
                        <Switch>
                          <Route
                            component={MainMenu}
                            path='/menu'
                          />
                          <Route
                            component={Archive}
                            path='/archive/:series?'
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
                  </PluginDetector>
                </Switch>
              </BrowserRouter>
            </AutobahnProvider>
          </HelmetProvider>
        </QueryClientProvider>
      </ThemeSettingsProvider>
    </SettingsProvider>
  );
}

export default App;
