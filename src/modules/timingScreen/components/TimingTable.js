import { useEffect, useRef } from "react";
import { Stat, StatExtractor } from '@timing71/common';
import styled from "styled-components";

import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";
import { useSetting } from "../../settings";
import { TimingTableHeader } from "./TimingTableHeader";
import { TimingTableRow } from "./TimingTableRow";

const TimingTableWrapper = styled.div`
  grid-area: timing;
  overflow: auto;
  height: 100%;
`;

const TimingTableInner = styled.table`

  margin: 0;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;

  td, th {
    padding: 0.5em;
    line-height: 1;
    white-space: nowrap;
  }
`;

export const TimingTable = () => {

  const { manifest } = useServiceManifest();
  const { state } = useServiceState();

  const [hiddenCols] = useSetting('columns.hidden', []);

  const highlights = useRef({});
  const now = Date.now();

  const statExtractor = new StatExtractor(manifest?.colSpec || []);

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
            (state.cars || []).map(
              (car, idx) => {
                const carNum = statExtractor.get(car, Stat.NUM, idx);
                return (
                  <TimingTableRow
                    car={car}
                    hiddenCols={hiddenCols}
                    highlight={doHighlight && ((state.highlight || []).includes(carNum) || (highlights.current[carNum] || 0) > now)}
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
