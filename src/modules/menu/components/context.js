import { createContext, useContext } from "react";

const MenuContext = createContext();

export const MenuContextProvider = ({ children, value }) => (
  <MenuContext.Provider value={value}>
    { children }
  </MenuContext.Provider>
);

export const useMenuContext = () => useContext(MenuContext);
