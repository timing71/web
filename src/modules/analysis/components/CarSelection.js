import { observer } from 'mobx-react-lite';
import styled from 'styled-components';

import { useAnalysis } from './context';
import { Option, Select } from '../../../components/Select';

const CarOption = styled(Option).attrs(
  props => ({
    value: props.car.raceNum
  })
)`
  color: ${ props => (props.car && props.theme.classColours[props.car.classColorString]) || props.theme.site.highlightColor };
`;

export const CarSelection = observer(
  ({ onChange, selectedCar }) => {
    const analysis = useAnalysis();

    return (
      <Select
        onChange={onChange}
        value={selectedCar}
      >
        <option
          disabled
          selected={!selectedCar}
          value={null}
        >
          -- Select a car --
        </option>
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
