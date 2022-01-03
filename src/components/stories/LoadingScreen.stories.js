/* eslint-disable import/no-anonymous-default-export */

import { ThemeDecorator } from "../../stories/decorators";
import { LoadingScreen as LoadingScreenComponent } from "../LoadingScreen";

export default {
  title: 'Loading Screen',
  component: LoadingScreenComponent,
  decorators: [
    ThemeDecorator,
  ]
};

const Template = (args) => (<LoadingScreenComponent {...args} />);

export const LoadingScreen = Template.bind({});
LoadingScreen.args = {
  message: 'Hello world'
};
