// src/components/LanguageSwitcher.jsx
import { useLanguage } from "../context/useLanguage";

export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`lang-switcher-container ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        className={`lang-btn ${lang === "en" ? "active" : ""}`}
        onClick={() => setLang("en")}
        title="Standard English language"
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <span className="lang-separator">|</span>
      <button
        type="button"
        className={`lang-btn ${lang === "pt" ? "active" : ""}`}
        onClick={() => setLang("pt")}
        title="Idioma em Português"
        aria-pressed={lang === "pt"}
      >
        PT
      </button>
    </div>
  );
}
