/* eslint-disable import/no-anonymous-default-export */

import { createAnalyser } from "..";
import { HelmetDecorator, ThemeDecorator } from "../../../stories/decorators";
import { StintDetailModal as SDM } from "../components/strategy/components/StintDetailModal";

import elms from './elms-portimao.json';

const analysis = createAnalyser(elms);

export default {
  title: 'Analysis/Stint Detail Modal',
  component: SDM,
  decorators: [
    ThemeDecorator,
    HelmetDecorator
  ]
};

const Template = (args) => (
  <SDM
    stint={analysis.cars.get('22').stints[1]}
    {...args}
  />
);

export const StintDetailModal = Template.bind({});
