import { createContext, useContext, useState } from "react";
import { THEMES } from "../data/themes";

const STORAGE_KEY = "wordgarden_theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKeyRaw] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && THEMES[saved] ? saved : "forest";
  });

  const setThemeKey = (key) => {
    if (THEMES[key]) {
      localStorage.setItem(STORAGE_KEY, key);
      setThemeKeyRaw(key);
    }
  };

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
