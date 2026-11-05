// src/components/NotFound.jsx
import { useLanguage } from "../context/useLanguage";
import LanguageSwitcher from "./LanguageSwitcher";
import "./NotFound.css";

export default function NotFound({ onBackToHome, onExploreWorks }) {
  const { t, lang } = useLanguage();

  const handleAskAlomyr = () => {
    window.dispatchEvent(
      new CustomEvent("open-alomyr-chat", {
        detail: {
          prompt:
            lang === "en"
              ? "Hi Alomyr! I got lost on a 404 page. What are Matheus's main projects and how do I navigate the portfolio?"
              : "Olá Alomyr! Me perdi em uma rota inexistente (404). Quais são os principais projetos do Matheus e como navego pelo portfólio?"
        }
      })
    );
  };

  return (
    <div className="notfound-container">
      {/* Top minimal bar */}
      <header className="notfound-header">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (onBackToHome) onBackToHome();
          }}
          className="notfound-brand"
        >
          <img src="/wolf(2).png" alt="Wolf logo" className="notfound-brand-logo" />
          <span>Matheus de Castro</span>
        </a>
        <LanguageSwitcher />
      </header>

      {/* Main 404 Hero */}
      <main className="notfound-main">
        <div className="notfound-card">
          {/* Animated Mascot Area */}
          <div className="notfound-mascot-wrapper">
            <div className="notfound-mascot-glow"></div>
            <div className="notfound-mascot-orbit">
              <span className="orbit-star s1">✦</span>
              <span className="orbit-star s2">✨</span>
              <span className="orbit-star s3">✦</span>
            </div>
            <img
              src="/wolf(2).png"
              alt="Cute Cyber Wolf"
              className="notfound-wolf-mascot"
            />
            <div className="notfound-mascot-shadow"></div>
          </div>

          {/* Badge */}
          <div className="notfound-badge">
            <span className="pulse-spark">✦</span>
            <span>{t("notfound.badge")}</span>
          </div>

          {/* Big Error Number & Title */}
          <h1 className="notfound-code">404</h1>
          <h2 className="notfound-title">{t("notfound.title")}</h2>
          <p className="notfound-subtitle">{t("notfound.subtitle")}</p>

          {/* Action Buttons */}
          <div className="notfound-actions">
            <button
              type="button"
              className="notfound-btn primary"
              onClick={onBackToHome}
            >
              <span>{t("notfound.back_home")}</span>
            </button>

            <button
              type="button"
              className="notfound-btn secondary"
              onClick={handleAskAlomyr}
            >
              <span>{t("notfound.ask_alomyr")}</span>
            </button>

            <button
              type="button"
              className="notfound-btn tertiary"
              onClick={onExploreWorks}
            >
              <span>{t("notfound.explore_works")}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="notfound-footer">
        <p>© {new Date().getFullYear()} Matheus de Castro • Portfolio</p>
      </footer>
    </div>
  );
}
