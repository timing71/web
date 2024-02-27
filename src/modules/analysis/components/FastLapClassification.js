import { Stat, StatExtractor } from '@timing71/common';

import { useMemo } from 'react';
import { Helmet } from "react-helmet-async";

import { useAnalysis } from "./context";
import { ServiceManifestContext, ServiceStateContext } from "../../../components/ServiceContext";
import { TimingTable } from '../../timingScreen';

export const FastLapClassification = () => {

  const analysis = useAnalysis();

  const manifest = analysis.manifest;

  const filteredColspec = useMemo(
    () => filterColspec([...manifest.colSpec], analysis),
    [analysis, manifest]
  );

  const filteredCarRows = useMemo(
    () => filterCarRows(analysis.state.cars, filteredColspec),
    [analysis.state.cars, filteredColspec]
  );

  return (
    <ServiceManifestContext.Provider value={{ manifest: { colSpec: filteredColspec.map(s => s[1]) } }}>
      <ServiceStateContext.Provider value={{ state: { cars: filteredCarRows } }}>
        <Helmet>
          <title>Fastest lap classification</title>
        </Helmet>
        <h3>Fastest lap classification</h3>
        <TimingTable />
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

const filterCarRows = (carRows, filteredColspec) => {
  return carRows.map(
    car => filteredColspec.map(
      ([idx, _, mapFunc]) => {
        if (typeof(mapFunc) === 'function') {
          return mapFunc(car);
        }
        return car[idx];
      }
    )
  ).sort(
    (a, b) => (a[a.length - 1][0] || 99999) - (b[b.length - 1][0] || 99999)
  );
};
