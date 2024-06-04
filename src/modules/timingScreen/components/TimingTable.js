import { useEffect, useRef } from "react";
import { Stat, StatExtractor } from '@timing71/common';
import styled from "styled-components";

import { useServiceManifest, useServiceState } from "../../../components/ServiceContext";
import { useSetting } from "../../settings";
import { TimingTableHeader } from "./TimingTableHeader";
import { TimingTableRow } from "./TimingTableRow";
import { useCallback } from 'react';
import { useState } from 'react';

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

  const [focusedCarNum, setFocusedCarNum] = useState(null);

  const statExtractor = new StatExtractor(manifest?.colSpec || []);

  const addHighlight = useCallback(
    (carNum) => {
      highlights.current[carNum] = Date.now() + 3000;
    },
    []
  );

  useEffect(
    () => {
      (state.highlight || []).forEach(addHighlight);
    },
    [addHighlight, state.highlight]
  );

  const [ doHighlight ] = useSetting('animation');

  useEffect(
    () => {
      if (focusedCarNum) {
        const row = document.querySelector(`tr[data-car-number="${focusedCarNum}"]`);
        if (row) {
          row.scrollIntoView({ block: 'center' });
        }
      }
    },
    [focusedCarNum, state]
  );

  return (
    <TimingTableWrapper>
      <TimingTableInner>
        <TimingTableHeader
          manifest={manifest}
          setFocusedCarNum={setFocusedCarNum}
        />
        <tbody>
          {
            (state.cars || []).map(
              (car, idx) => {
                const carNum = statExtractor.get(car, Stat.NUM, idx);
                const ident = [
                  carNum,
                  statExtractor.get(car, Stat.CAR, idx),
                  statExtractor.get(car, Stat.CLASS, idx),
                ];
                return (
                  <TimingTableRow
                    car={car}
                    focused={focusedCarNum === carNum}
                    hiddenCols={hiddenCols}
                    highlight={doHighlight && ((state.highlight || []).includes(carNum) || (highlights.current[carNum] || 0) > now)}
                    key={ident.join(',')}
                    manifest={manifest}
                    position={idx + 1}
                    setFocusedCarNum={setFocusedCarNum}
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
