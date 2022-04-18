/* eslint-disable import/no-anonymous-default-export */

import { ThemeDecorator } from "../../../../stories/decorators";
import { FlagState } from '../../../../racing';
import { FlagPanel as FlagPanelComponent } from "../FlagPanel";

export default {
  title: 'Flag Panel',
  component: FlagPanelComponent,
  argTypes: {
    flag: {
      options: Object.values(FlagState),
      control: 'select'
    }
  },
  decorators: [
    ThemeDecorator,
  ]
};

const Template = (args) => (<FlagPanelComponent {...args}>Flag panel</FlagPanelComponent>);

export const FlagPanel = Template.bind({});
FlagPanel.args = {
  flag: FlagState.GREEN
};
