import { Service } from "./service";

export const LeMansCup = (props) => (
  <Service
    host='data.lemanscup.com'
    name='Le Mans Cup'
    {...props}
  />
);

LeMansCup.regex = /live\.lemanscup\.com/;
