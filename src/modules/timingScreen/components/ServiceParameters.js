import { Fragment, useCallback, useState } from "react";
import { useDialogState } from "reakit";
import styled from "styled-components";
import { ListAlt } from "styled-icons/material";

import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";
import { Dialog, DialogBackdrop } from "../../menu/components/Dialog";
import { stopEventBubble } from "../../../utils";
import { Input } from "../../../components/Forms";
import { Button } from "../../../components/Button";

const ParamLabel = styled.th`
  text-align: left;
`;

const HelpText = styled.td`
  display: block;
  font-weight: normal;
  font-size: large;
  color: white;

  && {
    padding-top: 0;
  }
`;

const ValueInputTd = styled.td.attrs({ rowSpan: 2 })`
  white-space: nowrap;
`;

const TableWrapper = styled.div`
  flex-grow: 1;
  font-size: x-large;
`;

const ParamsDialog = ({ dialog }) => {
  const { manifest, setServiceParameters } = useServiceManifest();
  const { state } = useServiceState();

  const params = state?.meta?.parameters || {};
  const spec = manifest?.parameters || {};

  const [workingParams, setWorkingParams] = useState({ ...params });

  const changeParam = useCallback(
    (key, value) => {
      setWorkingParams(
        prev => ({ ...prev, [key]: value })
      );
    },
    []
  );

  return (
    <DialogBackdrop {...dialog}>
      <Dialog
        aria-label="Set service parameters"
        onDoubleClick={stopEventBubble()}
        {...dialog}
      >
        <h3>Set service parameters</h3>
        <TableWrapper>
          <table>
            <tbody>
              {
                Object.entries(spec).map(
                  ([key, pspec]) => (
                    <Fragment key={key}>
                      <tr>
                        <ParamLabel>
                          {pspec.label}
                        </ParamLabel>
                        <ValueInputTd>
                          <Input
                            onChange={e => changeParam(key, pspec.type === 'number' ? e.target.valueAsNumber : e.target.value)}
                            type={pspec.type}
                            value={workingParams[key] || ''}
                          />
                          {pspec.unit}
                        </ValueInputTd>
                      </tr>
                      <tr>
                        <HelpText>{pspec.description}</HelpText>
                      </tr>
                    </Fragment>
                  )
                )
              }
            </tbody>
          </table>
        </TableWrapper>

        <Button
          onClick={() => { setServiceParameters(workingParams); dialog.toggle(); }}
        >
          Save
        </Button>

      </Dialog>
    </DialogBackdrop>
  );

};

const SettingsIcon = styled(ListAlt)`
  fill: ${ props => props.theme.site.highlightColor };

  width: 32px;
  height: 32px;

  &:hover {
    cursor: pointer;
    fill: white;
  }
`;

const MyButton = styled(Button)`
  background-color: transparent;
  padding: 0;
  border: 0;
  margin-left: 0.5em;

  & svg {
    fill: ${ props => props.theme.site.highlightColor };
  }

  &:focus {
    outline: none;
  }

  &:hover {
    background-color: transparent;
  }
`;

export const ServiceParameters = () => {
  const dialog = useDialogState();

  return (
    <>
      <MyButton
        onClick={dialog.toggle}
        title='Set session parameters'
      >
        <SettingsIcon />
      </MyButton>
      <ParamsDialog
        dialog={dialog}
      />
    </>
  );
};
