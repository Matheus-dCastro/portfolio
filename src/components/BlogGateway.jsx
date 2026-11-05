// src/components/BlogGateway.jsx
// Split Gateway Intermediary Screen (/blog/?)
import React from "react";
import { useLanguage } from "../context/useLanguage";
import LanguageSwitcher from "./LanguageSwitcher";
import "./BlogGateway.css";

export default function BlogGateway({ onSelectChannel, onBackToHome }) {
  const { t, lang } = useLanguage();

  const handleSelect = (channel, path) => {
    if (onSelectChannel) {
      onSelectChannel(channel);
    } else {
      window.location.href = path;
    }
  };

  return (
    <div className="blog-gateway-container">
      {/* Background glow effects */}
      <div className="gateway-bg-gradient left"></div>
      <div className="gateway-bg-gradient right"></div>

      {/* Top Header */}
      <header className="gateway-header">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (onBackToHome) onBackToHome();
            else window.location.href = "/";
          }}
          className="gateway-back-btn"
          title={t("blog.back_to_portfolio")}
        >
          <svg
            className="gateway-back-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>{t("blog.back_to_portfolio")}</span>
        </a>

        <div className="gateway-brand">
          <img src="/wolf(2).png" alt="Wolf Logo" className="gateway-brand-logo" />
          <span className="gateway-brand-name">Matheus de Castro</span>
        </div>

        <div className="gateway-lang-wrapper">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Split Gateway Hero */}
      <main className="gateway-main">
        <div className="gateway-hero-text">
          <div className="gateway-badge">
            <span className="badge-pulse"></span>
            {t("blog.gateway_badge")}
          </div>
          <h1 className="gateway-title">{t("blog.gateway_title")}</h1>
          <p className="gateway-subtitle">{t("blog.gateway_subtitle")}</p>

          {/* Active Construction & Preview Notice */}
          <div className="gateway-wip-notice">
            <div className="wip-notice-badge">
              <span className="wip-dot"></span>
              <span>{lang === "en" ? "WORK IN PROGRESS • EXPERIMENTAL PREVIEW" : "EM CONSTRUÇÃO • PRÉVIA EXPERIMENTAL"}</span>
            </div>
            <p className="wip-notice-text">
              {lang === "en"
                ? "Please note: The engineering blog and Alomyr lab feeds are currently under active development. Layouts, media embeds, and publications are being refined and are not yet in final production use."
                : "Atenção: Os canais do Blog de Engenharia e do Laboratório Alomyr estão atualmente em fase ativa de construção. Os layouts, mídias e postagens estão sendo refinados e ainda não estão em uso definitivo."}
            </p>
          </div>
        </div>

        {/* Portals Split Cards */}
        <div className="gateway-portals-grid">
          {/* Portal 1: Engenharia & IA (/blog) */}
          <div
            className="gateway-card card-tech"
            onClick={() => handleSelect("tech", "/blog")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelect("tech", "/blog")}
          >
            <div className="card-top-glow tech-glow"></div>
            <div className="card-header">
              <div className="card-icon-wrapper tech-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                  <rect x="9" y="9" width="6" height="6"></rect>
                  <line x1="9" y1="1" x2="9" y2="4"></line>
                  <line x1="15" y1="1" x2="15" y2="4"></line>
                  <line x1="9" y1="20" x2="9" y2="23"></line>
                  <line x1="15" y1="20" x2="15" y2="23"></line>
                  <line x1="20" y1="9" x2="23" y2="9"></line>
                  <line x1="20" y1="14" x2="23" y2="14"></line>
                  <line x1="1" y1="9" x2="4" y2="9"></line>
                  <line x1="1" y1="14" x2="4" y2="14"></line>
                </svg>
              </div>
              <span className="card-tag tech-tag">{t("blog.portal_tech_tag")}</span>
            </div>

            <h2 className="card-title">{t("blog.portal_tech_title")}</h2>
            <p className="card-desc">{t("blog.portal_tech_desc")}</p>

            <div className="card-chips">
              <span className="chip">#FastAPI</span>
              <span className="chip">#PyTorch</span>
              <span className="chip">#TimescaleDB</span>
              <span className="chip">#Telemetry</span>
              <span className="chip">#DevOps</span>
            </div>

            <div className="card-footer">
              <span className="card-action-btn tech-btn">
                <span>{t("blog.portal_tech_btn")}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
              <span className="card-route-hint">rota: <code>/blog</code></span>
            </div>
          </div>

          {/* Portal 2: Laboratório Alomyr (/blog/alomyr) */}
          <div
            className="gateway-card card-alomyr"
            onClick={() => handleSelect("alomyr", "/blog/alomyr")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelect("alomyr", "/blog/alomyr")}
          >
            <div className="card-top-glow alomyr-glow"></div>
            <div className="card-header">
              <div className="card-icon-wrapper alomyr-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                  <path d="M2 2l7.586 7.586"></path>
                  <circle cx="11" cy="11" r="2"></circle>
                </svg>
              </div>
              <span className="card-tag alomyr-tag">{t("blog.portal_alomyr_tag")}</span>
            </div>

            <h2 className="card-title">{t("blog.portal_alomyr_title")}</h2>
            <p className="card-desc">{t("blog.portal_alomyr_desc")}</p>

            <div className="card-chips">
              <span className="chip">#Hiper-realismo</span>
              <span className="chip">#Retrogaming</span>
              <span className="chip">#Marvel</span>
              <span className="chip">#Filosofia</span>
              <span className="chip">#Linux</span>
            </div>

            <div className="card-footer">
              <span className="card-action-btn alomyr-btn">
                <span>{t("blog.portal_alomyr_btn")}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
              <span className="card-route-hint">rota: <code>/blog/alomyr</code></span>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="gateway-bottom-info">
          <p>
            {lang === "en"
              ? "Both channels offer bidirectional links to technical projects and seamless switching."
              : "Ambos os canais contam com links bidirecionais para os projetos técnicos e alternância rápida."}
          </p>
        </div>
      </main>
    </div>
  );
}
