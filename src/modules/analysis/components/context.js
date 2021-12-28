import { createContext, useContext } from 'react';

const AnalysisContext = createContext();

export const AnalysisProvider = ({ analysis, children }) => (
  <AnalysisContext.Provider value={analysis}>
    { children }
  </AnalysisContext.Provider>
);

export const useAnalysis = () => useContext(AnalysisContext);
