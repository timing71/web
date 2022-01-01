import styled from "styled-components";
import { useAnalysis } from "../../context";

const CarBox = styled.rect.attrs(
  props => ({
    ...props,
    width: 250,
    x: 0,
    y: 0,
    rx: 3
  })
)`
  stroke: ${ props => (props.car && props.theme.classColours[(props.car.raceClass || '').toLowerCase().replace(/[-/ ]/, '')]) || '#C0C0C0' };
`;

const CarNum = styled.text.attrs(
  props => ({
    children: props.car.raceNum,
    dominantBaseline: 'middle',
    textAnchor: 'middle',
    x: 30,
  })
)`
  fill: ${ props => (props.car && props.theme.classColours[(props.car.raceClass || '').toLowerCase().replace(/[-/ ]/, '')]) || '#C0C0C0' };
  font-size: 28px;
  font-family: ${ props => props.theme.site.headingFont };
`;

const Detail = styled.text.attrs(
  {
    dominantBaseline: 'middle'
  }
)`
  clip-path: polygon(0 0, 0 18px, 180px 18px, 180px 0);
  font-family: ${ props => props.theme.site.headingFont };
  font-size: 16px;
  fill: white;
`;

export const CarsList = () => {
  const analysis = useAnalysis();
  const cars = analysis.carsInRunningOrder;

  const overallHeight = cars.length * 72;

  return (
    <svg
      height={overallHeight}
      style={{ marginTop: 33 }}
      width={260}
    >
      {
        cars.map(
          (car, idx) => (
            (
              <g
                key={`car-${car.raceNum}`}
                transform={`translate(0, ${(idx * 71) + 4})`}
              >
                <CarBox
                  car={car}
                  height={64}
                />
                <CarNum
                  car={car}
                  y={32}
                />
                <Detail
                  x={60}
                  y={20}
                >
                  {car.teamName}
                </Detail>
                <Detail
                  x={60}
                  y={44}
                >
                  {car.make}
                </Detail>
              </g>
            )
          )
        )
      }
    </svg>
  );
};
