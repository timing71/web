/* eslint-disable import/no-anonymous-default-export */

import { AnalysisDataDecorator } from ".";
import { HelmetDecorator, ThemeDecorator } from "../../../stories/decorators";
import { Messages as MessagesComponent } from "../components/Messages";

export default {
  title: 'Analysis/Messages',
  component: MessagesComponent,
  decorators: [
    ThemeDecorator,
    HelmetDecorator,
    AnalysisDataDecorator
  ]
};

export const Messages = () => (
  <MessagesComponent />
);
