import styled from "styled-components";
import { animated } from '@react-spring/web';

import { useAnalysis } from "../../context";
import { observer } from "mobx-react-lite";
import { useYPosTransition } from "./hooks";
import { CAR_LIST_WIDTH, HEADER_HEIGHT, ROW_HEIGHT, ROW_PADDING } from "../constants";

const CarNum = styled.span.attrs(
  props => ({
    children: props.car.raceNum
  })
)`
  color: ${ props => (props.car && props.theme.classColours[props.car.classColorString]) || '#C0C0C0' };
  font-size: 28px;

  grid-row: 1 / span 2;
  align-self: center;
  justify-self: center;
`;

const Detail = styled.span`
  color: white;

  font-weight: ${ props => !!props.bold ? 'bold' : 'normal' };
`;

const CarBox = styled(animated.div)`

  position: absolute;

  width: ${CAR_LIST_WIDTH}px;
  height: ${ ROW_HEIGHT - (2 * ROW_PADDING) }px;
  overflow: hidden;

  margin: ${ ROW_PADDING }px 0;

  background-color: ${ props => (props.car && props.car.state && props.theme.carStates[props.car.state]?.rowBackground && props.theme.carStates[props.car.state].rowBackground[0]) || 'black' };
  border: 1px solid ${ props => (props.car && props.theme.classColours[props.car.classColorString]) || '#C0C0C0' };
  border-radius: 0.25em;

  display: grid;
  grid-template-columns: 4em minmax(0, 1fr);
  justify-content: center;
  align-items: center;

  font-family: ${ props => props.theme.site.headingFont };

`;

const CarsListInner = styled.div`
  height: ${ props => props._height }px;
  padding-top: ${ HEADER_HEIGHT }px;
  position: relative;
`;

export const CarsList = observer(
  ({ classFilter }) => {
    const analysis = useAnalysis();
    const cars = analysis.carsInRunningOrder.filter(c => !classFilter || c.classColorString === classFilter);
    const yPosTransition = useYPosTransition(cars);

    return (
      <CarsListInner _height={ cars.length * 74 }>
        {
          yPosTransition(
            (style, car) => {
              return (
                <CarBox
                  car={car}
                  key={`car-${car.raceNum}`}
                  style={style}
                >
                  <CarNum car={car} />
                  <Detail bold>{ car.teamName || car.drivers[0]?.name }</Detail>
                  <Detail>{ car.make }</Detail>
                </CarBox>
              );
            }
          )
        }
      </CarsListInner>
    );
  }
);
