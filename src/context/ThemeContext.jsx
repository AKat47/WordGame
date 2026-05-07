import { createContext, useContext, useState } from "react";
import { THEMES } from "../data/themes";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState("forest");
  const theme = THEMES[themeKey];

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setThemeKey, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
