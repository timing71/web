import { useRef } from "react";
import { useEffect } from "react/cjs/react.development";
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

  const highlights = useRef({});
  const now = Date.now();

  const statExtractor = new StatExtractor(manifest?.columnSpec || []);

  useEffect(
    () => {
      const now = Date.now();
      (state.highlight || []).forEach(
        hlCar => {
          highlights.current[hlCar] = now + 3000;
        }
      );
    },
    [state.highlight]
  );

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
                    highlight={doHighlight && (highlights.current[carNum] || 0) > now}
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
