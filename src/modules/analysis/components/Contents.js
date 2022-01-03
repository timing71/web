import { Redirect, Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { routes } from './routes';

const Container = styled.div`
  grid-area: main;

  padding: 0.5em;
  overflow: hidden;
  border-left: 1px solid ${ props => props.theme.site.highlightColor };

  .fade-enter {
    opacity: 0;
    z-index: 1;
  }

  .fade-enter.fade-enter-active {
    opacity: 1;
    transition: opacity 150ms ease-in;
  }

  & > div {
    height: 100%;
  }

`;

export const Contents = () => {
  const { path, url } = useRouteMatch();
  const location = useLocation();
  return (
    <Container>
      <TransitionGroup>
        <CSSTransition
          classNames="fade"
          key={location.pathname}
          timeout={300}
        >
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
        </CSSTransition>
      </TransitionGroup>
    </Container>
  );
};
