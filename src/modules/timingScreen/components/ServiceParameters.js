import { useCallback, useState } from "react";
import { useDialogState } from "reakit";
import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";
import { useFullscreenContext } from "../../../components/FullscreenContext";
import { Dialog, DialogBackdrop } from "../../menu/components/Dialog";
import { stopEventBubble } from "../../../utils";
import { Input } from "../../../components/Forms";
import { Button } from "../../../components/Button";

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
        <table>
          <tbody>
            {
              Object.entries(spec).map(
                ([key, pspec]) => (
                  <tr key={key}>
                    <th>{pspec.label}</th>
                    <td>
                      <Input
                        onChange={e => changeParam(key, pspec.type === 'number' ? e.target.valueAsNumber : e.target.value)}
                        type={pspec.type}
                        value={workingParams[key] || ''}
                      />
                    </td>
                  </tr>
                )
              )
            }
          </tbody>
        </table>

        <Button
          onClick={() => { setServiceParameters(workingParams); dialog.toggle(); }}
        >
          Save
        </Button>

      </Dialog>
    </DialogBackdrop>
  );

};

export const ServiceParameters = () => {
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
      <button onClick={show}>
        Set
      </button>
      <ParamsDialog
        dialog={dialog}
      />
    </>
  );
};
