import { MenuItem as RkMenuItem } from "reakit/Menu";
import { DialogDisclosure } from 'reakit/Dialog';
import styled, { css } from "styled-components";

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

  ${
    props => !!props.disabled && css`
      color: gray;
      cursor: not-allowed;

      & > label {
        cursor: not-allowed;
      }

      &:hover {
        background-color: transparent;
        color: gray;
      }
    `
  }
`;

export const DialogMenuItem = styled(DialogDisclosure).attrs({ as: 'div' })`
  font-size: medium;
  min-height: 2em;
  color: ${ props => props.theme.site.highlightColor };
  background: transparent;
  border: 0;
  padding: 0.25em;

  min-width: 15vw;

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
