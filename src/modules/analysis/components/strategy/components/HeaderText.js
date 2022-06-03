import styled from "styled-components";

export const HeaderText = styled.text`
  fill: ${ props => props.current ? 'red' : props.theme.site.highlightColor };
  font-family: ${ props => props.theme.site.headingFont };
  text-anchor: middle;
  dominant-baseline: hanging;
`;
