import { Stat, StatExtractor } from '@timing71/common';

import { useMemo } from 'react';
import { Helmet } from "react-helmet-async";

import { useAnalysis } from "./context";
import { ServiceManifestContext, ServiceStateContext } from "../../../components/ServiceContext";
import { TimingTable } from '../../timingScreen';
import { FocusedCarContextProvider } from '../../timingScreen/context';
import { useSetting } from '../../settings';
import { Control, Controls, TypeSelector } from './Controls';

const Mode = {
  BEST_LAP: 1,
  LAST_LAP: 2,
};

export const FastLapClassification = () => {

  const analysis = useAnalysis();

  const [mode, setMode] = useSetting('analysis.fastLapClassification.displayMode', Mode.BEST_LAP);

  const manifest = analysis.manifest;

  const filteredColspec = useMemo(
    () => filterColspec([...manifest.colSpec], analysis),
    [analysis, manifest]
  );

  const filteredCarRows = useMemo(
    () => {
      return analysis.state.cars.map(
        car => filteredColspec.map(
          ([idx, _, mapFunc]) => {
            if (typeof(mapFunc) === 'function') {
              return mapFunc(car);
            }
            return car[idx];
          }
        )
      ).sort(
        (a, b) => (a[a.length - mode][0] || 99999) - (b[b.length - mode][0] || 99999)
      );
    },
    [analysis.state.cars, filteredColspec, mode]
  );

  return (
    <ServiceManifestContext.Provider value={{ manifest: { colSpec: filteredColspec.map(s => s[1]) } }}>
      <ServiceStateContext.Provider value={{ state: { cars: filteredCarRows } }}>
        <Helmet>
          <title>Fastest lap classification</title>
        </Helmet>
        <Controls>
          <h3>Fastest lap classification</h3>
          <Control>
            <label htmlFor='chart-type'>
              Sort by:
            </label>
            <TypeSelector
              id='chart-type'
              onChange={(e) => setMode(e.target.value)}
              value={mode}
            >
              <option value={Mode.BEST_LAP}>Best lap</option>
              <option value={Mode.LAST_LAP}>Last lap</option>
            </TypeSelector>
          </Control>
        </Controls>
        <FocusedCarContextProvider>
          <TimingTable />
        </FocusedCarContextProvider>
      </ServiceStateContext.Provider>
    </ServiceManifestContext.Provider>
  );
};

const REQUIRED_COLUMNS = [
  Stat.NUM,
  Stat.STATE,
  Stat.CLASS,
  Stat.DRIVER,
  Stat.TEAM,
  Stat.LAPS,
  Stat.LAST_LAP,
  Stat.BEST_LAP
];

const filterColspec = (colSpec, analysis) => {
  const filtered = Object.entries(colSpec).filter(
    ([_, stat]) => {
      return REQUIRED_COLUMNS.findIndex(
        c => c[0] === stat[0]
      ) >= 0;
    }
  );

  if (filtered[filtered.length - 1][1][0] !== Stat.BEST_LAP[0]) {
    const statExtractor = new StatExtractor(colSpec);
    // Best lap is not in the manifest! We need to synthesise this column
    filtered.push([null, Stat.BEST_LAP, (car) => {
      const num = statExtractor.get(car, Stat.NUM);
      const fl = analysis.cars.get(num)?.bestLap;

      return [fl, 'old'];
    }]);
  }

  return filtered;
};
