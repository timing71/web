import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Helmet } from 'react-helmet';

import { PluginDetector } from './modules/pluginBridge';

import { Home } from './pages/Home';
import { Start } from './pages/Start';
import { Timing } from './pages/Timing';
import { Theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={Theme}>
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
    </ThemeProvider>
  );
}

export default App;
