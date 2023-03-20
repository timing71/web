import { createAnalyser } from '@timing71/common/analysis';
import { AnalysisProvider } from '../components/context';
import data from './elms-portimao.json';

const analyser = createAnalyser(data);

export const AnalysisDataDecorator = (a=analyser) => (Story) => (
  <AnalysisProvider analysis={a}>
    <Story />
  </AnalysisProvider>
);
