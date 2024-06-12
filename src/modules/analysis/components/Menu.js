import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';

import { MenuItem } from './MenuItem';
import { PerCarMenu } from './PerCarMenu';
import { routes } from './routes';

const MenuWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  margin-left: 0.5em;
  padding: 0;
  flex-grow: 1;

  overflow-y: auto;
`;

export const Menu = ({ selectedCar, setSelectedCar }) => {

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
      <PerCarMenu
        selectedCar={selectedCar}
        setSelectedCar={setSelectedCar}
      />
    </MenuWrapper>
  );
};
