import {
  Dialog as RDialog,
  DialogBackdrop as RDialogBackdrop,
} from "reakit/Dialog";
import styled from "styled-components";

export const DialogBackdrop = styled(RDialogBackdrop)`
  position: fixed;
  background-color: rgba(0, 0, 0, 0.7);
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const Dialog = styled(RDialog)`
  border: 2px solid ${props => props.theme.site.highlightColor};
  border-radius: 0.5rem;
  padding: 0.5rem;
  background-color: black;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  min-width: 50vw;
  min-height: 70vh;
  max-height: 85vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;

  & > table {
    min-width: 75%;
    border-collapse: collapse;
    font-family: ${ props => props.theme.site.headingFont };
    color: ${ props => props.theme.site.highlightColor };

    thead {
      border-bottom: 1px solid ${ props => props.theme.site.highlightColor };
    }

    & td, & th {
    padding: 0.5em;
  }
  }
`;
