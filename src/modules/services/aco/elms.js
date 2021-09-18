import { Service } from "./service";

export const ELMS = (props) => (
  <Service
    host='data.europeanlemansseries.com'
    name='European Le Mans Series'
    {...props}
  />
);

ELMS.regex = /live\.europeanlemansseries\.com/;
