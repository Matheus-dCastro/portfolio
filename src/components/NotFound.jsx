// src/components/NotFound.jsx
import { useState, useEffect } from "react";
import { useLanguage } from "../context/useLanguage";
import LanguageSwitcher from "./LanguageSwitcher";
import { getStoredNotFoundConfig, fetchNotFoundConfig } from "../lib/supabaseService";
import "./NotFound.css";

export default function NotFound({ onBackToHome, onExploreWorks, previewConfig }) {
  const { t, lang } = useLanguage();
  const [config, setConfig] = useState(() => previewConfig || getStoredNotFoundConfig());

  useEffect(() => {
    if (previewConfig) {
      setConfig(previewConfig);
      return;
    }
    fetchNotFoundConfig().then((loaded) => {
      if (loaded) setConfig(loaded);
    });
  }, [previewConfig]);

  const activeBadge =
    lang === "en"
      ? config.badgeEn || t("notfound.badge")
      : config.badgePt || t("notfound.badge");

  const activeTitle =
    lang === "en"
      ? config.titleEn || t("notfound.title")
      : config.titlePt || t("notfound.title");

  const activeSubtitle =
    lang === "en"
      ? config.subtitleEn || t("notfound.subtitle")
      : config.subtitlePt || t("notfound.subtitle");

  const activeBackHome =
    lang === "en"
      ? config.buttonHomeEn || config.backHomeTextEn || t("notfound.back_home")
      : config.buttonHomePt || config.backHomeTextPt || t("notfound.back_home");

  const activeAskAlomyr =
    lang === "en"
      ? config.buttonAskAlomyrEn || config.askAlomyrTextEn || t("notfound.ask_alomyr")
      : config.buttonAskAlomyrPt || config.askAlomyrTextPt || t("notfound.ask_alomyr");

  const activeExploreWorks =
    lang === "en"
      ? config.buttonProjectsEn || config.exploreWorksTextEn || t("notfound.explore_works")
      : config.buttonProjectsPt || config.exploreWorksTextPt || t("notfound.explore_works");

  const handleAskAlomyr = () => {
    const promptToSend =
      lang === "en"
        ? config.askAlomyrPromptEn || config.alomyrPromptEn || "Hi Alomyr! I got lost on a 404 page. What are Matheus's main projects and how do I navigate the portfolio?"
        : config.askAlomyrPromptPt || config.alomyrPromptPt || "Olá Alomyr! Me perdi em uma rota inexistente (404). Quais são os principais projetos do Matheus e como navego pelo portfólio?";

    window.dispatchEvent(
      new CustomEvent("open-alomyr-chat", {
        detail: { prompt: promptToSend }
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
              src={config.mascotImage || "/wolf(2).png"}
              alt="Cute Cyber Wolf"
              className="notfound-wolf-mascot"
              onError={(e) => {
                e.target.src = "/wolf(2).png";
              }}
            />
            <div className="notfound-mascot-shadow"></div>
          </div>

          {/* Badge */}
          <div className="notfound-badge">
            <span className="pulse-spark">✦</span>
            <span>{activeBadge}</span>
          </div>

          {/* Big Error Number & Title */}
          <h1 className="notfound-code">{config.statusCode || config.errorCode || "404"}</h1>
          <h2 className="notfound-title">{activeTitle}</h2>
          <p className="notfound-subtitle">{activeSubtitle}</p>

          {/* Action Buttons */}
          <div className="notfound-actions">
            <button
              type="button"
              className="notfound-btn primary"
              onClick={onBackToHome}
            >
              <span>{activeBackHome}</span>
            </button>

            <button
              type="button"
              className="notfound-btn secondary"
              onClick={handleAskAlomyr}
            >
              <span>{activeAskAlomyr}</span>
            </button>

            <button
              type="button"
              className="notfound-btn tertiary"
              onClick={onExploreWorks}
            >
              <span>{activeExploreWorks}</span>
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
