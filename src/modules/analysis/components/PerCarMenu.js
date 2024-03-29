import { useEffect } from 'react';
import { Link, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { CarSelection } from "./CarSelection";
import { MenuItem } from './MenuItem';
import { perCarRoutes } from './routes';

export const PerCarMenu = ({ selectedCar, setSelectedCar }) => {

  const match = useRouteMatch();
  const location = useLocation();
  const history = useHistory();

  const { url } = match;
  useEffect(
    () => {
      if (location.pathname.includes('/cars/')) {
        const sameRouteWithCurrentCar = location.pathname.replace(/\/cars\/[^/]+/, `/cars/${selectedCar}`);
        if (sameRouteWithCurrentCar !== location.pathname) {
          if (selectedCar) {
            history.push(sameRouteWithCurrentCar);
          }
          else {
            const raceNum = location.pathname.match(/(?:\/cars\/)([^/]+)/);
            setSelectedCar(raceNum[1]);
          }
        }
      }
    },
    [history, location, match, selectedCar, setSelectedCar]
  );

  return (
    <>
      <h4>Select a car</h4>
      <CarSelection
        onChange={e => setSelectedCar(e.target.value)}
        selectedCar={selectedCar || ''}
      />
      {
        perCarRoutes.map(
          (route, idx) => (
            <MenuItem
              current={`${url}${route.path}`.replace(':raceNum', selectedCar) === location.pathname}
              key={idx}
            >
              {
                !!selectedCar && (
                <Link
                  to={`${url}${route.path}`.replace(':raceNum', selectedCar)}
                >
                  {route.name}
                </Link>
                )
              }
              {
                !selectedCar && (
                  <span>{route.name}</span>
                )
              }
            </MenuItem>
          )
        )
      }
    </>
  );
};
