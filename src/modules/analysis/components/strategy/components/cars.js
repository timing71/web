import styled from "styled-components";

const CarBox = styled.rect.attrs(
  props => ({
    ...props,
    width: 250,
    x: 0,
    y: 0,
    rx: 5
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

export const carsLayer = (args) => {
  const { bars } = args;
  return (
    <g className='cars-layer'>
      {
        bars.map(
          bar => {
            const car = bar.data.data;
            return (
              <g
                key={`car-${car.raceNum}`}
                transform={`translate(-260, ${bar.y})`}
              >
                <CarBox
                  car={car}
                  height={bar.height}
                />
                <CarNum
                  car={car}
                  y={bar.height / 2}
                />
                <Detail
                  x={60}
                  y={18}
                >
                  {car.teamName}
                </Detail>
                <Detail
                  x={60}
                  y={bar.height - 18}
                >
                  {car.make}
                </Detail>
              </g>
            );
          }
        )
      }
    </g>
  );
};
