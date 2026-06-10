import { createContext, useContext, useState } from 'react';

const AnalysisContext = createContext();

export const AnalysisProvider = ({ analysis, children }) => (
  <AnalysisContext.Provider value={analysis}>
    { children }
  </AnalysisContext.Provider>
);

export const useAnalysis = () => useContext(AnalysisContext);

const SelectedCarContext = createContext();

export const useSelectedCar = () => useContext(SelectedCarContext);

export const SelectedCarProvider = ({ children }) => {
  const stateFuncs = useState(null);
  return (
    <SelectedCarContext.Provider value={stateFuncs}>
      { children }
    </SelectedCarContext.Provider>
  );
};
