import { useCallback } from "react";
import { useDialogState } from "reakit/Dialog";
import styled from "styled-components";
import { ViewColumn } from "styled-icons/material";
import { Button } from "../../../components/Button";
import { useFullscreenContext } from "../../../components/FullscreenContext";
import { useServiceState } from "../../../components/ServiceContext";

import { useSetting } from "../../settings";
import { DialogMenuItem } from "./MenuItem";
import { Dialog, DialogBackdrop } from "./Dialog";

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

const Title = styled.div`
  display: flex;
  align-self: stretch;
  align-items: center;

  & h1 {
    flex-grow: 1;
    margin: 0.25em;
  }
`;

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
    <DialogBackdrop {...dialog}>
      <Dialog
        aria-label='Configure columns'
        {...dialog}
      >
        <Title>
          <h1>Configure columns</h1>
          <Button onClick={dialog.toggle}>
            Close
          </Button>
        </Title>
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

      </Dialog>
    </DialogBackdrop>
  );
};

export const ColumnSettings = () => {

  const dialog = useDialogState();

  const fs = useFullscreenContext();

  const show = useCallback(
    () => {
      if (fs.active) {
        fs.exit();
      }
      dialog.toggle();
    },
    [dialog, fs]
  );

  return (
    <>
      <DialogMenuItem
        onClick={show}
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
