import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import { useSetting } from '../../../settings';
import { useAnalysis } from '../context';
import { Controls } from '../Controls';
import { RadarChart } from './Graphics';

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const Radar = observer(
  () => {
    const analysis = useAnalysis();

    const [useLaps, setUseLaps] = useSetting('analysis.radar.useLaps', false);

    if (!Radar.test(analysis)) {
      return null;
    }

    return (
      <>
        <Controls>
          <h3>Track radar</h3>
          <label>
            <input
              checked={useLaps}
              onChange={(e) => setUseLaps(e.target.checked)}
              type='checkbox'
            />
            Separate by laps
          </label>
        </Controls>
        <Wrapper>
          <RadarChart
            useLaps={useLaps}
          />
        </Wrapper>
      </>
    );
  }
);


Radar.test = (analysis) => {
  return analysis.state?.meta?.positions;
};
