import { AnalysisProvider } from '../components/context';
import { createAnalyser } from '..';
import data from '../__tests__/2021_lm24.json';

export const AnalysisDataDecorator = (Story) => (
  <AnalysisProvider analysis={createAnalyser(data)}>
    <Story />
  </AnalysisProvider>
);
