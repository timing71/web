/* eslint-disable import/no-anonymous-default-export */

import { AnalysisDataDecorator } from ".";
import { HelmetDecorator, ThemeDecorator } from "../../../stories/decorators";
import { DriveTime as DT } from "../components/driveTime";

export default {
  title: 'Analysis/Drive Time',
  component: DT,
  decorators: [
    ThemeDecorator,
    HelmetDecorator,
    AnalysisDataDecorator
  ]
};

export const DriveTime = () => (
  <DT />
);
