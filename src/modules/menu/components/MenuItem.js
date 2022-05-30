import { MenuItem as RkMenuItem } from "reakit/Menu";
import styled from "styled-components";

export const MenuItem = styled(RkMenuItem).attrs({ as: 'div' })`
  font-size: medium;
  min-height: 2em;
  color: ${ props => props.theme.site.highlightColor };
  border: 0;
  padding: 0.25em;

  min-width: 15vw;
`;

export const ToggleMenuItem = styled(MenuItem)`
  display: flex;
  align-items: center;

  &:hover {
    background-color: ${ props => props.theme.site.highlightColor };
    color: black;
  }

  & span {
    width: 24px;
  }

  & label {
    flex-grow: 1;
    margin: 0 1em;
  }
`;
