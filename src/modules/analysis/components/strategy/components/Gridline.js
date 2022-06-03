import styled from "styled-components";

export const Gridline = styled.line`
  stroke: ${ props => props.current ? 'red' : props.theme.site.highlightColor };
`;
