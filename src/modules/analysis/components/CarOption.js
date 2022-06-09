import styled from "styled-components";
import { Option } from "../../../components/Select";

export const CarOption = styled(Option).attrs(
  props => ({
    children: props.children || `#${props.car.raceNum} - ${props.car.identifyingString}`,
    value: props.value || props.car.raceNum
  })
)`
  color: ${ props => (props.car && props.theme.classColours[props.car.classColorString]) || props.theme.site.highlightColor };
`;
