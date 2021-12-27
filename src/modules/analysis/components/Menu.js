
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { routes } from './routes';

const MenuWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  margin-left: 0.5em;
  padding: 0;

  overflow-y: auto;
`;

const MenuItem = styled.li`
  & a {

    display: block;

    background: linear-gradient(90deg, black 0 50%, ${ props => props.theme.site.highlightColor} 50% 100%) repeat-y;
    background-size: 200%;
    background-position: ${ props => props.current ? '100%' : '0'};
    color: ${ props => props.current ? 'black' : 'white' };
    border: 1px solid transparent;
    border-right: 0;

    font-family: ${ props => props.theme.site.headingFont };

    text-decoration: none;

    cursor: pointer;

    margin-bottom: 0.125em;
    padding: 0.5em 1em;

    border-radius: 0.25em 0 0 0.25em;

    &:hover {
      border-color: ${ props => props.current ? 'transparent' : props.theme.site.highlightColor};
      color: ${ props => props.current ? 'black' : props.theme.site.highlightColor};
    }

    transition: color 0.15s ease-in-out, border-color 0.15s ease-in-out, background-position 0.15s ease-in-out;

  }

`;

export const Menu = () => {

  const { url } = useRouteMatch();
  const location = useLocation();

  return (
    <MenuWrapper>
      {
        routes.map(
          (route, idx) => (
            <MenuItem
              current={`${url}${route.path}` === location.pathname}
              key={idx}
            >
              <Link
                to={`${url}${route.path}`}
              >
                {route.name}
              </Link>
            </MenuItem>
          )
        )
      }
    </MenuWrapper>
  );
};
