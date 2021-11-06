import { Timer } from "@styled-icons/material-sharp";
import { useSetting } from "../../settings";

export const DelayIndicator = () => {

  const [delay] = useSetting('delay');

  if (delay > 0) {
    return (
      <div>
        <Timer
          size={16}
          title='Delay'
        />
        { delay }s
      </div>
    );
  }

  return null;

};
