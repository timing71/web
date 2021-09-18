import { TimingTableHeader } from "./TimingTableHeader";
import { TimingTableRow } from "./TimingTableRow";

export const TimingTable = ({ state }) => {
  return (
    <table>
      <TimingTableHeader manifest={state.manifest} />
      <tbody>
        {
          state.cars.map(
            (car) => (
              <TimingTableRow
                car={car}
                key={car[0]}
                manifest={state.manifest}
              />
            )
          )
        }
      </tbody>
    </table>
  );
};
