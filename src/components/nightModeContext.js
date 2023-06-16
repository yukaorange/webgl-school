import { createContext, useState } from "react";

export const NightModeContext = createContext({
  nightMode: false,
  setNightMode: () => {},
});

export const NightModeProvider = ({ children }) => {
  const [nightMode, setNightMode] = useState(false);


  return (
    <NightModeContext.Provider value={{ nightMode, setNightMode }}>
      {children}
    </NightModeContext.Provider>
  );
};

export default NightModeContext;
