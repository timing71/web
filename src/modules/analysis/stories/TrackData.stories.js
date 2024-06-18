/* eslint-disable import/no-anonymous-default-export */

import { createAnalyser } from '@timing71/common/analysis';
import { AnalysisDataDecorator } from ".";
import { HelmetDecorator, ThemeDecorator } from "../../../stories/decorators";
import { TrackData as TD } from "../components/trackData";

import data from './lm24-warmup.json';

const analyser = createAnalyser(data);

export default {
  title: 'Analysis/Track Data',
  component: TD,
  decorators: [
    ThemeDecorator,
    HelmetDecorator,
    AnalysisDataDecorator(analyser)
  ]
};

export const TrackData = () => (
  <TD />
);
