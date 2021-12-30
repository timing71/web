import styled from 'styled-components';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { observer } from 'mobx-react-lite';

import { useAnalysis } from "../context";

dayjs.extend(duration);

const SubLine = styled.small`
  display: block;
  color: #C0C0C0;
  text-align: center;
`;

const PossiblyPredictedValue = ({ formatter, includePredicted=true, predicted, value }) => {
  if (value === null && predicted) {
    return '???';
  }
  return (
    <>
      { formatter(value) }
      { predicted && includePredicted ? ' (predicted)' : null }
    </>
  );
};

const Container = styled.div`
  font-size: xx-large;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const DistancePrediction = observer(
  () => {
    const analysis = useAnalysis();
    const leaderLap = analysis.session.leaderLap;
    const prediction = analysis.distancePrediction;

    if (prediction) {
      return (
        <Container>
          <span>
            Lap <b>{leaderLap}</b> / {' '}
            <PossiblyPredictedValue
              formatter={v => v + leaderLap}
              {...prediction.laps}
            />
          </span>
          <SubLine>
            <PossiblyPredictedValue
              formatter={v => dayjs.duration(v * 1000).format('HH:mm:ss')}
              {...prediction.time}
            /> / { ' ' }
            <PossiblyPredictedValue
              formatter={v => `${v} lap${v === 1 ? '' : 's'}`}
              includePredicted={false}
              {...prediction.laps}
            /> to go
          </SubLine>
        </Container>
      );
    }
    return (
      <SubLine>No prediction available</SubLine>
    );
  }
);
