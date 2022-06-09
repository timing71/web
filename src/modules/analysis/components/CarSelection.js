import { observer } from 'mobx-react-lite';

import { useAnalysis } from './context';
import { Select } from '../../../components/Select';
import { CarOption } from './CarOption';

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
          value=''
        >
          -- Select a car --
        </option>
        {
          analysis.cars.map(
            c => (
              <CarOption
                car={c}
                key={c.raceNum}
              />
            )
          )
        }
      </Select>
    );
  }
);
