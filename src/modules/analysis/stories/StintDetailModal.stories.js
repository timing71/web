/* eslint-disable import/no-anonymous-default-export */

import { useState } from "react";
import { createAnalyser } from "@timing71/common/analysis";
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

const car = analysis.cars.get('22');

const Template = () => {
  const randomStint = () => Math.floor(Math.random() * car.stints.length);
  const [stintNum, setStintNum] = useState(randomStint);

  return (
    <SDM
      close={() => setStintNum(randomStint())}
      stint={car.stints[stintNum]}
    />
  );
};

export const StintDetailModal = Template.bind({});
