import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';

import { routes } from './routes';

const Container = styled.div`
  grid-area: main;

  padding: 0.5em;
  overflow: auto;
`;

export const Contents = () => {
  const { path, url } = useRouteMatch();
  return (
    <Container>
      <Switch>
        <Route
          exact
          path={path}
        >
          <Redirect to={`${url}/session`} />
        </Route>
        {
          routes.map(
            (route, idx) => (
              <Route
                component={route.component}
                key={idx}
                path={`${path}${route.path}`}
              />
            )
          )
        }
      </Switch>
    </Container>
  );
};
