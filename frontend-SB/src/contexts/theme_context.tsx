import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const DarkModeContext = createContext({ dark: false, toggle: () => {} });

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => localStorage.getItem("darkMode") === "true");
  useEffect(() => {
    localStorage.setItem("darkMode", String(dark));
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return <DarkModeContext.Provider value={{ dark, toggle: () => setDark((p) => !p) }}>{children}</DarkModeContext.Provider>;
}

// eslint-disable-next-line react/only-export-components
export const useDarkMode = () => useContext(DarkModeContext);
