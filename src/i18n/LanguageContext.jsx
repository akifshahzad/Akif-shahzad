import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { TRANSLATIONS } from "./translations";

const STORAGE_KEY = "akif-portfolio-lang";
const LanguageContext = createContext(null);

function getInitialLanguage() {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "ur" ? "ur" : "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = TRANSLATIONS[lang].dir;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const toggleLanguage = () => setLang((prev) => (prev === "en" ? "ur" : "en"));

  const value = useMemo(
    () => ({ lang, dict: TRANSLATIONS[lang], toggleLanguage }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Returns { lang, dict, toggleLanguage }. `dict` mirrors the shape in translations.js. */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
