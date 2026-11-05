// src/context/languageState.js
import { createContext } from "react";
import { translations } from "../lib/translations";

export const LanguageContext = createContext(null);

export function detectBrowserLanguage() {
  try {
    const list = Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || ""];

    for (const raw of list) {
      if (typeof raw === "string") {
        const clean = raw.trim().toLowerCase();
        if (clean.startsWith("pt")) {
          return "pt";
        }
        if (clean.startsWith("en")) {
          return "en";
        }
      }
    }
  } catch (e) {
    console.warn("Language detection error:", e);
  }
  return "pt"; // Default fallback
}

export function getInitialLanguage() {
  try {
    const saved = localStorage.getItem("portfolio_lang");
    if (saved === "en" || saved === "pt") {
      return saved;
    }

    // Automatic browser language detection
    return detectBrowserLanguage();
  } catch (e) {
    console.warn("Language initialization error:", e);
  }

  return "pt";
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
