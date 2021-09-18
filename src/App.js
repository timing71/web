import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { PluginDetector } from './modules/pluginBridge';
import { Start } from './pages/Start';
import { Timing } from './pages/Timing';

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
