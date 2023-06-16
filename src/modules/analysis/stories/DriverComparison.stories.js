/* eslint-disable import/no-anonymous-default-export */

import { AnalysisDataDecorator } from ".";
import { HelmetDecorator, ThemeDecorator } from "../../../stories/decorators";
import { DriverComparison as DC } from "../components/driverComparison";

export default {
  title: 'Analysis/Driver Comparison',
  component: DC,
  decorators: [
    ThemeDecorator,
    HelmetDecorator,
    AnalysisDataDecorator()
  ]
};

export const DriverComparison = () => (
  <DC />
);
