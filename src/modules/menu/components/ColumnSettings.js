import { useCallback } from "react";
import {
  useDialogState,
  Dialog,
  DialogBackdrop,
} from "reakit/Dialog";
import styled from "styled-components";
import { ViewColumn } from "styled-icons/material";
import { useServiceState } from "../../../components/ServiceContext";

import { useSetting } from "../../settings";
import { DialogMenuItem } from "./MenuItem";

const MyDialogBackdrop = styled(DialogBackdrop)`
  position: fixed;
  background-color: rgba(0, 0, 0, 0.7);
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const MyDialog = styled(Dialog)`
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

const StatName = styled.td`
  text-transform: uppercase;
  color: ${ props => props.theme.site.highlightColor };
`;

const Heading = styled.th`
  text-transform: uppercase;
  text-align: left;

  &:first-child {
    text-align: center;
  }
`;

const CheckColumn = styled.td`
  text-align: center;
`;

// Enjoy the cognitive dissonance:
const Column = styled.tr`
  color: ${ props => props.$hidden ? 'grey' : 'white' };
  background-color: ${ props => props.$hidden ? '#200000' : 'black' };

  &:nth-child(odd) {
    background-color: ${ props => props.$hidden ? '#200000' : '#202020' };
  }
`;

const ColumnConfig = ({ col, isHidden, toggleVisibility }) => (
  <Column
    $hidden={isHidden}
    onClick={toggleVisibility}
  >
    <CheckColumn>
      <input
        checked={!isHidden}
        onChange={toggleVisibility}
        type='checkbox'
      />
    </CheckColumn>
    <StatName>{col[0]}</StatName>
    <td>{col[2]}</td>
  </Column>
);

const ColumnConfigDialog = ({ dialog }) => {

  const [hiddenCols, setHiddenCols] = useSetting('columns.hidden', []);

  const { state } = useServiceState();

  const usedCols = state?.manifest?.colSpec || [];

  const toggleHidden = useCallback(
    (col) => () => {
      if (hiddenCols.includes(col)) {
        setHiddenCols(hiddenCols.filter(c => c !== col));
      }
      else {
        setHiddenCols([...hiddenCols, col]);
      }
    },
    [hiddenCols, setHiddenCols]
  );

  return (
    <MyDialogBackdrop {...dialog}>
      <MyDialog {...dialog}>
        <h1>Configure columns</h1>
        <table>
          <thead>
            <tr>
              <Heading>Visible</Heading>
              <Heading>Column</Heading>
              <Heading>Description</Heading>
            </tr>
          </thead>
          <tbody>
            {
              usedCols.map(
                (col, idx) => (
                  <ColumnConfig
                    col={col}
                    isHidden={hiddenCols.includes(col[0])}
                    key={idx}
                    toggleVisibility={toggleHidden(col[0])}
                  />
                )
              )
            }
          </tbody>
        </table>

      </MyDialog>
    </MyDialogBackdrop>
  );
};

export const ColumnSettings = () => {

  const dialog = useDialogState();

  return (
    <>
      <DialogMenuItem
        onClick={dialog.toggle}
        {...dialog}
      >
        <span>
          <ViewColumn size={24} />
        </span>
        <label>Configure columns...</label>
      </DialogMenuItem>
      <ColumnConfigDialog dialog={dialog} />
    </>
  );
};
