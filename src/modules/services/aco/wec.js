import { Service } from "./service";

export const WEC = (props) => (
  <Service
    host='data.fiawec.com'
    name='FIA WEC'
    {...props}
  />
);

WEC.regex = /live\.fiawec\.com/;
