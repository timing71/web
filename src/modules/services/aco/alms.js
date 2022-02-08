import { Service } from "./service";

export const ALMS = (props) => (
  <Service
    host='data.asianlemansseries.com'
    name='Asian Le Mans Series'
    {...props}
  />
);

ALMS.regex = /live\.asianlemansseries\.com/;
