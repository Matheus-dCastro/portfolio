import { useState, useEffect, useMemo } from "react";
import { getStoredCvConfig } from "../data/projectsData";
import { fetchCvConfig } from "../lib/supabaseService";
import { useLanguage } from "../context/useLanguage";

function Perfil({ nomeCompleto, description, foto, cv }) {
  const { t, lang } = useLanguage();
  const [textoAtual, setTextoAtual] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeSpeed, setTypeSpeed] = useState(150);
  const [showCvModal, setShowCvModal] = useState(false);
  const [cvConfig, setCvConfig] = useState(() => getStoredCvConfig());
  const [userSelectedLang, setUserSelectedLang] = useState(null);

  // Idioma ativo no modal: se o usuário alternou no modal, usa a escolha; senão, segue o idioma global do site
  const modalLang = userSelectedLang || lang;

  const frases = useMemo(
    () => t("hero.roles") || ["Matheus de Castro", "Backend Developer", "Machine Learning Student"],
    [t]
  );

  useEffect(() => {
    fetchCvConfig().then((cfg) => {
      if (cfg) setCvConfig(cfg);
    });
  }, []);

  const handleOpenCvModal = () => {
    fetchCvConfig().then((cfg) => {
      if (cfg) setCvConfig(cfg);
    });
    setUserSelectedLang(null);
    setShowCvModal(true);
  };

  useEffect(() => {
    const currentPhrase = frases[phraseIndex % frases.length] || "Matheus de Castro";

    const handleTyping = () => {
      if (!isDeleting) {
        setTextoAtual(currentPhrase.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
        setTypeSpeed(150);

        if (charIndex + 1 === currentPhrase.length) {
          setTypeSpeed(2000);
          setIsDeleting(true);
        }
      } else {
        setTextoAtual(currentPhrase.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
        setTypeSpeed(80);

        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % frases.length);
          setTypeSpeed(500);
        }
      }
    };

    const timer = setTimeout(handleTyping, typeSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, typeSpeed, frases]);

  const heroSubtitle = description || t("hero.subtitle");

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="profile-wrapper">
          <img src={foto} alt={nomeCompleto} className="profile-pic" />
        </div>

        <h1 className="typewriter-text">
          {phraseIndex === 1 && isDeleting === false ? (
            <span className="outline">{textoAtual}</span>
          ) : (
            textoAtual
          )}
        </h1>

        <p className="hero-subtitle">{heroSubtitle}</p>

        <div className="btn-group">
          <a href="#projects" className="btn">
            {t("hero.see_projects")}
          </a>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleOpenCvModal}
            title={t("cv_modal.subtitle")}
          >
            {t("hero.download_cv")}
          </button>
        </div>
      </div>

      <div className="card-container">
        <div className="split-card">
          <div className="side design">{t("hero.card_art")}</div>
          <div className="side coder">{t("hero.card_coder")}</div>
        </div>
      </div>

      {/* CV Download / View Modal */}
      {showCvModal && (() => {
        const isEn = modalLang === "en";
        const activeGoogleDocs = isEn
          ? (cvConfig.googleDocsUrlEn || cvConfig.googleDocsUrl)
          : (cvConfig.googleDocsUrlPt || cvConfig.googleDocsUrl);

        const activePdf = isEn
          ? (cvConfig.pdfUrlEn || cvConfig.pdfUrl || cv)
          : (cvConfig.pdfUrlPt || cvConfig.pdfUrl || cv);

        const downloadFileName = isEn
          ? "Matheus_de_Castro_Resume_EN.pdf"
          : "Matheus_de_Castro_Curriculo_PT.pdf";

        const docsBadge = isEn ? "Interactive Web Version (EN)" : "Versão Web Interativa (PT)";
        const pdfBadge = isEn ? "Official PDF Document (EN)" : "Documento Oficial PDF (PT)";

        return (
          <div className="cv-modal-overlay" onClick={() => setShowCvModal(false)}>
            <div className="cv-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="cv-modal-header">
                <div className="cv-modal-title-group">
                  <span className="cv-modal-icon"></span>
                  <div>
                    <h3>{t("cv_modal.title")}</h3>
                    <p>{t("cv_modal.subtitle")}</p>
                  </div>
                </div>
                <div className="cv-modal-header-actions">
                  <div className="cv-modal-lang-toggle" role="group" aria-label="CV Language">
                    <button
                      type="button"
                      className={`cv-lang-chip ${isEn ? "active" : ""}`}
                      onClick={() => setUserSelectedLang("en")}
                      title="English Resume"
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      className={`cv-lang-chip ${!isEn ? "active" : ""}`}
                      onClick={() => setUserSelectedLang("pt")}
                      title="Currículo em Português"
                    >
                      PT
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn-close-cv-modal"
                    onClick={() => setShowCvModal(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="cv-modal-options">
                {/* Option 1: Google Docs Web Version */}
                <a
                  href={activeGoogleDocs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cv-option-card gdocs-card"
                  onClick={() => setShowCvModal(false)}
                >
                  <div className="cv-option-text">
                    <div className="cv-option-badge">{docsBadge}</div>
                    <h4>{t("cv_modal.gdocs_title")}</h4>
                    <p>{t("cv_modal.gdocs_desc")}</p>
                  </div>
                  <span className="cv-option-arrow">↗</span>
                </a>

                {/* Option 2: PDF Download */}
                <a
                  href={activePdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={downloadFileName}
                  className="cv-option-card pdf-card"
                  onClick={() => setShowCvModal(false)}
                >
                  <div className="cv-option-text">
                    <div className="cv-option-badge">{pdfBadge}</div>
                    <h4>{t("cv_modal.pdf_title")}</h4>
                    <p>{t("cv_modal.pdf_desc")}</p>
                  </div>
                  <span className="cv-option-arrow">↓</span>
                </a>
              </div>

              <div className="cv-modal-footer">
                <span className="cv-footer-hint">
                  {t("cv_modal.footer_hint")} {cvConfig.updatedAt ? `• ${t("admin.updated_label")}: ${cvConfig.updatedAt}` : ""}
                </span>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}

export default Perfil;
