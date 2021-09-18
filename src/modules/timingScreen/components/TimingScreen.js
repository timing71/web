import { TimingScreenHeader } from "./TimingScreenHeader";
import { TimingTable } from "./TimingTable";

export const TimingScreen = ({ state }) => {
  return (
    <div>
      <TimingScreenHeader state={state} />
      <TimingTable state={state} />
    </div>
  );
};
