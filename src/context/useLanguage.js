// src/context/useLanguage.js
import { useContext } from "react";
import { LanguageContext, translate } from "./languageState";

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: "en",
      setLang: () => {},
      toggleLang: () => {},
      t: (key, fallback = "") => translate("en", key, fallback)
    };
  }
  return context;
}

export default useLanguage;
