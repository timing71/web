import styled from "styled-components";
import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";
import { Stat } from "../../../racing";
import { StatExtractor } from "../../../statExtractor";
import { useSetting } from "../../settings";
import { TimingTableHeader } from "./TimingTableHeader";
import { TimingTableRow } from "./TimingTableRow";

const TimingTableWrapper = styled.div`
  grid-area: timing;
  overflow: auto;
`;

const TimingTableInner = styled.table`

  margin: 0;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  width: 100%;
  border-collapse: collapse;

  td, th {
    padding: 0.5em;
    line-height: 1;
    white-space: nowrap;
  }
`;

export const TimingTable = () => {

  const { manifest } = useServiceManifest();
  const { state } = useServiceState();

  const statExtractor = new StatExtractor(manifest?.columnSpec || []);
  const highlight = state.highlight || [];
  const [ doHighlight ] = useSetting('animation');

  return (
    <TimingTableWrapper>
      <TimingTableInner>
        <TimingTableHeader manifest={manifest} />
        <tbody>
          {
            state.cars.map(
              (car, idx) => {
                const carNum = statExtractor.get(car, Stat.NUM, idx);
                return (
                  <TimingTableRow
                    car={car}
                    highlight={doHighlight && highlight.includes(carNum)}
                    key={carNum}
                    manifest={manifest}
                    position={idx + 1}
                    statExtractor={statExtractor}
                  />
                );
              }
            )
          }
        </tbody>
      </TimingTableInner>
    </TimingTableWrapper>
  );
};
