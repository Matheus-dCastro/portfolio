// src/components/BlogGateway.jsx
// Split Gateway Intermediary Screen (/blog/?)
import React from "react";
import { useLanguage } from "../context/useLanguage";
import LanguageSwitcher from "./LanguageSwitcher";
import "./BlogGateway.css";

export default function BlogGateway({ config = {}, onSelectChannel, onBackToHome }) {
  const { t, lang } = useLanguage();

  const topBadge =
    lang === "en"
      ? config.topBadgeEn || t("blog.gateway_badge") || "MATHEUS DE CASTRO ECOSYSTEM"
      : config.topBadgePt || t("blog.gateway_badge") || "ECOSSISTEMA MATHEUS DE CASTRO";

  const gatewayTitle =
    lang === "en"
      ? config.gatewayTitleEn || t("blog.gateway_title")
      : config.gatewayTitlePt || t("blog.gateway_title");

  const gatewaySubtitle =
    lang === "en"
      ? config.gatewaySubtitleEn || t("blog.gateway_subtitle")
      : config.gatewaySubtitlePt || t("blog.gateway_subtitle");

  const showWipNotice = config.wipNoticeVisible !== false;
  const wipNoticeBadge =
    lang === "en"
      ? config.wipNoticeBadgeEn || "ACTIVE REFINEMENT • EDITORIAL PREVIEW"
      : config.wipNoticeBadgePt || "EM REFINAMENTO • PRÉVIA EDITORIAL";
  const wipNoticeText =
    lang === "en"
      ? config.wipNoticeTextEn || "Notice: The Engineering Blog and Alomyr Lab channels are currently under active refinement."
      : config.wipNoticeTextPt || "Atenção: Os canais do Blog de Engenharia e do Laboratório Alomyr estão atualmente em fase ativa de refinamento.";

  // Card Tech
  const techBadge = lang === "en" ? config.cardTechBadgeEn || t("blog.portal_tech_tag") : config.cardTechBadgePt || t("blog.portal_tech_tag");
  const techTitle = lang === "en" ? config.cardTechTitleEn || t("blog.portal_tech_title") : config.cardTechTitlePt || t("blog.portal_tech_title");
  const techDesc = lang === "en" ? config.cardTechDescEn || t("blog.portal_tech_desc") : config.cardTechDescPt || t("blog.portal_tech_desc");
  const techTags = Array.isArray(config.cardTechTags) && config.cardTechTags.length > 0
    ? config.cardTechTags
    : ["#FastAPI", "#PyTorch", "#TimescaleDB", "#Telemetry", "#DevOps"];
  const techBtn = lang === "en" ? config.cardTechBtnEn || t("blog.portal_tech_btn") : config.cardTechBtnPt || t("blog.portal_tech_btn");

  // Card Alomyr
  const alomyrBadge = lang === "en" ? config.cardAlomyrBadgeEn || t("blog.portal_alomyr_tag") : config.cardAlomyrBadgePt || t("blog.portal_alomyr_tag");
  const alomyrTitle = lang === "en" ? config.cardAlomyrTitleEn || t("blog.portal_alomyr_title") : config.cardAlomyrTitlePt || t("blog.portal_alomyr_title");
  const alomyrDesc = lang === "en" ? config.cardAlomyrDescEn || t("blog.portal_alomyr_desc") : config.cardAlomyrDescPt || t("blog.portal_alomyr_desc");
  const alomyrTags = Array.isArray(config.cardAlomyrTags) && config.cardAlomyrTags.length > 0
    ? config.cardAlomyrTags
    : ["#Hiper-realismo", "#Retrogaming", "#Marvel", "#Filosofia", "#Linux"];
  const alomyrBtn = lang === "en" ? config.cardAlomyrBtnEn || t("blog.portal_alomyr_btn") : config.cardAlomyrBtnPt || t("blog.portal_alomyr_btn");

  // Footer Note
  const footerNote = lang === "en"
    ? config.footerNoteEn || "Both channels offer bidirectional links to technical projects and seamless switching."
    : config.footerNotePt || "Ambos os canais contam com links bidirecionais para os projetos técnicos e alternância rápida.";

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
            {topBadge}
          </div>
          <h1 className="gateway-title">{gatewayTitle}</h1>
          <p className="gateway-subtitle">{gatewaySubtitle}</p>

          {/* Active Construction & Preview Notice */}
          {showWipNotice && (
            <div className="gateway-wip-notice">
              <div className="wip-notice-badge">
                <span className="wip-dot"></span>
                <span>{wipNoticeBadge}</span>
              </div>
              <p className="wip-notice-text">{wipNoticeText}</p>
            </div>
          )}
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
              <span className="card-tag tech-tag">{techBadge}</span>
            </div>

            <h2 className="card-title">{techTitle}</h2>
            <p className="card-desc">{techDesc}</p>

            <div className="card-chips">
              {techTags.map((tag, idx) => (
                <span key={idx} className="chip">{tag.startsWith("#") ? tag : `#${tag}`}</span>
              ))}
            </div>

            <div className="card-footer">
              <span className="card-action-btn tech-btn">
                <span>{techBtn}</span>
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
              <span className="card-tag alomyr-tag">{alomyrBadge}</span>
            </div>

            <h2 className="card-title">{alomyrTitle}</h2>
            <p className="card-desc">{alomyrDesc}</p>

            <div className="card-chips">
              {alomyrTags.map((tag, idx) => (
                <span key={idx} className="chip">{tag.startsWith("#") ? tag : `#${tag}`}</span>
              ))}
            </div>

            <div className="card-footer">
              <span className="card-action-btn alomyr-btn">
                <span>{alomyrBtn}</span>
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
          <p>{footerNote}</p>
        </div>
      </main>
    </div>
  );
}
