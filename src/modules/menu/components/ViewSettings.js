import { useCallback } from "react";
import { useFullscreenContext } from "../../../components/FullscreenContext";
import { useSetting } from '../../settings';

import { Check, FormatColorFill, Fullscreen, Highlight } from '@styled-icons/material';

import { ToggleMenuItem } from "./MenuItem";

const ToggleSetting = ({ icon, label, name }) => {
  const [setting, setSetting] = useSetting(name);
  const toggle = useCallback(
    () => {
      setSetting(!setting);
    },
    [setSetting, setting]
  );

  return (
    <ToggleMenuItem
      onClick={toggle}
    >
      <span>
        { icon }
      </span>
      <label>{label}</label>
      <span>
        { !!setting && <Check size={24} /> }
      </span>
    </ToggleMenuItem>
  );

};

export const ViewSettings = () => {

  const fsHandle = useFullscreenContext();

  return (
    <>
      <ToggleMenuItem onClick={fsHandle.toggle}>
        <span>
          <Fullscreen size={24} />
        </span>
        <label>View full screen</label>
        <span>
          { !!fsHandle.active && <Check size={24} /> }
        </span>
      </ToggleMenuItem>
      <ToggleSetting
        icon={<FormatColorFill size={24} />}
        label='Use row background colours'
        name='backgrounds'
      />
      <ToggleSetting
        icon={<Highlight size={24} />}
        label='Use row flashing animations'
        name='animation'
      />
    </>
  );
};
