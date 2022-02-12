import { observer } from 'mobx-react-lite';
import styled from 'styled-components';

import { useAnalysis } from './context';
import { Option, Select } from '../../../components/Select';

const CarOption = styled(Option).attrs(
  props => ({
    value: props.car.raceNum
  })
)`
  color: ${ props => (props.car && props.theme.classColours[props.car.raceClass.toLowerCase().replace(/[-/ ]/, '')]) || props.theme.site.highlightColor };
`;

export const CarSelection = observer(
  ({ onChange, selectedCar }) => {
    const analysis = useAnalysis();

    return (
      <Select
        onChange={onChange}
        value={selectedCar}
      >
        {
          analysis.cars.map(
            c => (
              <CarOption
                car={c}
                key={c.raceNum}
              >
                #{c.raceNum} - {c.identifyingString}
              </CarOption>
            )
          )
        }
      </Select>
    );
  }
);