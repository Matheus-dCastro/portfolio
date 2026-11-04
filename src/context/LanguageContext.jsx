// src/context/LanguageContext.jsx
import { useState, useEffect, useCallback } from "react";
import { LanguageContext, getInitialLanguage, translate } from "./languageState";

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => getInitialLanguage());

  const setLang = useCallback((newLang) => {
    const target = newLang === "pt" ? "pt" : "en";
    setLangState(target);
    try {
      localStorage.setItem("portfolio_lang", target);
      if (typeof document !== "undefined") {
        document.documentElement.lang = target;
      }
    } catch (e) {
      console.warn("Error saving language preference:", e);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === "en" ? "pt" : "en";
      try {
        localStorage.setItem("portfolio_lang", next);
        if (typeof document !== "undefined") {
          document.documentElement.lang = next;
        }
      } catch (e) {
        console.warn("Error saving language preference:", e);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = useCallback((key, fallback = "") => translate(lang, key, fallback), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider;
