import { useState, useEffect } from "react";
import { getStoredCvConfig } from "../data/projectsData";

const FRASES = [
  "Matheus de Castro",
  // "Backend Developer",
  // "Machine Learning Student",
];

function Perfil({ nomeCompleto, description, foto, cv }) {
  const [textoAtual, setTextoAtual] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeSpeed, setTypeSpeed] = useState(150);
  const [showCvModal, setShowCvModal] = useState(false);
  const [cvConfig, setCvConfig] = useState(() => getStoredCvConfig());

  const handleOpenCvModal = () => {
    setCvConfig(getStoredCvConfig());
    setShowCvModal(true);
  };

  useEffect(() => {
    const currentPhrase = FRASES[phraseIndex];

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
          setPhraseIndex((prev) => (prev + 1) % FRASES.length);
          setTypeSpeed(500);
        }
      }
    };

    const timer = setTimeout(handleTyping, typeSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, typeSpeed]);

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

        <p className="hero-subtitle">{description}</p>

        <div className="btn-group">
          <a href="#projects" className="btn">
            See My Projects
          </a>
          <a href="#articles" className="btn btn-outline">
            📑 Artigos Técnicos
          </a>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleOpenCvModal}
            title="Escolha entre a versão Web no Google Docs ou arquivo PDF"
          >
            📄 Download CV / Docs
          </button>
        </div>
      </div>

      <div className="card-container">
        <div className="split-card">
          <div className="side design">ART</div>
          <div className="side coder">CODER IS</div>
        </div>
      </div>

      {/* CV Download / View Modal */}
      {showCvModal && (
        <div className="cv-modal-overlay" onClick={() => setShowCvModal(false)}>
          <div className="cv-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="cv-modal-header">
              <div className="cv-modal-title-group">
                <span className="cv-modal-icon">📄</span>
                <div>
                  <h3>Currículo de Matheus de Castro</h3>
                  <p>Escolha o formato que deseja visualizar ou baixar:</p>
                </div>
              </div>
              <button className="btn-close-cv-modal" onClick={() => setShowCvModal(false)}>✕</button>
            </div>

            <div className="cv-modal-options">
              {/* Option 1: Google Docs Web Version */}
              <a
                href={cvConfig.googleDocsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cv-option-card gdocs-card"
                onClick={() => setShowCvModal(false)}
              >
                <div className="cv-option-icon">🌐</div>
                <div className="cv-option-text">
                  <div className="cv-option-badge">Versão Web Interativa</div>
                  <h4>Abrir no Google Docs</h4>
                  <p>Visualização instantânea, sempre atualizada com as últimas experiências e projetos.</p>
                </div>
                <span className="cv-option-arrow">↗</span>
              </a>

              {/* Option 2: PDF Download */}
              <a
                href={cvConfig.pdfUrl || cv}
                target="_blank"
                rel="noopener noreferrer"
                download="Matheus_de_Castro_Curriculo.pdf"
                className="cv-option-card pdf-card"
                onClick={() => setShowCvModal(false)}
              >
                <div className="cv-option-icon">📄</div>
                <div className="cv-option-text">
                  <div className="cv-option-badge">Documento Oficial PDF</div>
                  <h4>Baixar Arquivo PDF</h4>
                  <p>Formato clássico ideal para impressão, arquivamento ou anexar em processos seletivos.</p>
                </div>
                <span className="cv-option-arrow">↓</span>
              </a>
            </div>

            <div className="cv-modal-footer">
              <span className="cv-footer-hint">💡 Ambos os formatos possuem o conteúdo completo e revisado.</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Perfil;
