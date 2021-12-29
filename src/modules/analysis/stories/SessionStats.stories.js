/* eslint-disable import/no-anonymous-default-export */

import { AnalysisDataDecorator } from ".";
import { HelmetDecorator, ThemeDecorator } from "../../../stories/decorators";
import { SessionStats as SS } from "../components/sessionStats";

export default {
  name: 'Analysis/Session stats',
  component: SS,
  decorators: [
    ThemeDecorator,
    HelmetDecorator,
    AnalysisDataDecorator
  ]
};

export const SessionStats = () => (
  <SS />
);
