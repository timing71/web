/* eslint-disable import/no-anonymous-default-export */

import { createAnalyser } from '@timing71/common/analysis';
import { AnalysisDataDecorator } from ".";
import { HelmetDecorator, SettingsDecorator, ThemeDecorator } from "../../../stories/decorators";
import { Radar } from "../components/radar/Radar";

import data from './elms-with-positions.json';

const analyser = createAnalyser(data);

export default {
  title: 'Analysis/Track Radar',
  component: Radar,
  decorators: [
    ThemeDecorator,
    HelmetDecorator,
    SettingsDecorator,
    AnalysisDataDecorator(analyser)
  ]
};

export const TrackRadar = () => (
  <Radar />
);
