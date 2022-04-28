import { Spinner } from "../../../components/Spinner";
import { useSetting } from "../../settings";
import { MenuItem } from "./MenuItem";

export const DelaySetting = () => {
  const [ delay, setDelay ] = useSetting('delay');
  return (
    <MenuItem>
      Delay (seconds):
      <Spinner
        min={0}
        onChange={e => setDelay(e || 0)}
        value={delay || 0}
      />
    </MenuItem>
  );
};
