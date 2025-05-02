import { createContext, useContext, useState } from 'react';

const FocusedCarContext = createContext();

export const useFocusedCarContext = () => useContext(FocusedCarContext);

export const FocusedCarContextProvider = ({ children }) => {
  const [focusedCarNum, setFocusedCarNum] = useState(null);
  return (
    <FocusedCarContext.Provider value={{ focusedCarNum, setFocusedCarNum }}>
      { children }
    </FocusedCarContext.Provider>
  );
};
