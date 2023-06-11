import { Control } from './Controls';
import { CarOption } from './CarOption';
import { useAnalysis } from './context';
import { TypeSelector } from './TypeSelector';

export const ClassFilter = ({ onChange, value }) => {
  const analysis = useAnalysis();
  return (
    <Control>
      <label htmlFor='class-filter'>
        Show class:
      </label>
      <TypeSelector
        id='class-filter'
        onChange={onChange}
        value={value}
      >
        <option value=''>All</option>
        {
          analysis.knownCarClasses.map(
            klass => (
              <CarOption
                car={{
                  classColorString: klass.toLowerCase().replace(/[-/ ]/, '')
                }}
                key={klass}
                value={klass.toLowerCase().replace(/[-/ ]/, '')}
              >
                {klass}
              </CarOption>
            )
          )
        }
      </TypeSelector>
    </Control>
  );
};
