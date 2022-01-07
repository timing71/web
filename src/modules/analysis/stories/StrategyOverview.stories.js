/* eslint-disable import/no-anonymous-default-export */

import { AnalysisDataDecorator } from ".";
import { HelmetDecorator, ThemeDecorator } from "../../../stories/decorators";
import { StrategyOverview as SO } from "../components/strategy";

export default {
  title: 'Analysis/Strategy Overview',
  component: SO,
  decorators: [
    ThemeDecorator,
    HelmetDecorator,
    AnalysisDataDecorator()
  ]
};

export const StrategyOverview = () => (
  <SO />
);
