/* eslint-disable import/no-anonymous-default-export */

import { AnalysisDataDecorator } from ".";
import { HelmetDecorator, SettingsDecorator, ThemeDecorator } from "../../../stories/decorators";
import { FastLapClassification as FLC } from "../components/FastLapClassification";

export default {
  title: 'Analysis/Fast Lap Classification',
  component: FLC,
  decorators: [
    ThemeDecorator,
    HelmetDecorator,
    SettingsDecorator,
    AnalysisDataDecorator()
  ]
};

export const FastLapClassification = () => (
  <FLC />
);
