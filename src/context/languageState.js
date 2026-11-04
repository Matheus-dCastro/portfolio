// src/context/languageState.js
import { createContext } from "react";
import { translations } from "../lib/translations";

export const LanguageContext = createContext(null);

export function getInitialLanguage() {
  try {
    const saved = localStorage.getItem("portfolio_lang");
    if (saved === "en" || saved === "pt") {
      return saved;
    }

    // Automatic browser language detection
    const browserLang = (navigator.language || navigator.userLanguage || "").toLowerCase();
    if (browserLang.startsWith("pt")) {
      return "pt";
    }
  } catch (e) {
    console.warn("Language detection error:", e);
  }

  // Default standardized language is 'en'
  return "en";
}

export function translate(lang, key, fallback = "") {
  const dict = translations[lang] || translations.en;
  if (dict && dict[key] !== undefined) {
    return dict[key];
  }
  if (translations.en && translations.en[key] !== undefined) {
    return translations.en[key];
  }
  return fallback || key;
}
