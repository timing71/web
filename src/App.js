import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Start } from './pages/Start';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          component={Start}
          path='/start'
        />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
