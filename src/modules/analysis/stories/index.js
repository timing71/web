import { AnalysisProvider } from '../components/context';
import { createAnalyser } from '..';
import data from '../__tests__/2021_lm24.json';

const analyser = createAnalyser(data);

export const AnalysisDataDecorator = (a=analyser) => (Story) => (
  <AnalysisProvider analysis={a}>
    <Story />
  </AnalysisProvider>
);
