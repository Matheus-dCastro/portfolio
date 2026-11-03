import { useState } from "react";
import { getStoredThoughts } from "../data/projectsData";

function About({ descriptionP1, descriptionP2, onAction }) {
  const [showThoughts, setShowThoughts] = useState(false);
  const [thoughts] = useState(() => getStoredThoughts());

  return (
    <>
      <div className="section-divider-line"></div>
      <p className="section-tag">Introduction</p>
      <h2>
        About <span>Me</span>
      </h2>
      <div className="about-container">
        <p
          className="about-text"
          dangerouslySetInnerHTML={{ __html: descriptionP1 }}
        ></p>
        <p className="about-text text-muted">{descriptionP2}</p>

        <div className="about-action-buttons">
          <button onClick={onAction} className="btn btn-outline">
            Explore Me (Hobbies & Arts)
          </button>

          {/* Secondary Thought Toggle - Kept strictly inside About Me as requested */}
          <button
            type="button"
            className={`btn-toggle-thoughts ${showThoughts ? "active" : ""}`}
            onClick={() => setShowThoughts(!showThoughts)}
            title="Acessar micro-reflexões sobre código, arte e tecnologia"
          >
            💭 {showThoughts ? "Ocultar Pensamentos ▲" : `Pensamentos & Reflexões (${thoughts.length}) ▼`}
          </button>
        </div>

        {/* Collapsible Thoughts Section (Subtle background layer) */}
        {showThoughts && (
          <div className="about-thoughts-drawer">
            <div className="thoughts-drawer-header">
              <span className="drawer-badge">⚡ Reflexões Pessoais em Segundo Plano</span>
              <p className="drawer-subtitle">
                Pensamentos concisos sobre a intersecção entre Deep Learning, arquitetura de software e desenho hiper-realista.
              </p>
            </div>

            <div className="thoughts-mini-grid">
              {thoughts.map((t) => (
                <article key={t.id} className="thought-mini-card">
                  <div className="thought-card-top">
                    <h4>{t.title}</h4>
                    {t.updatedAt && <span className="thought-date">{t.updatedAt}</span>}
                  </div>
                  <div className="thought-body-text">
                    <p>{t.content}</p>
                  </div>
                  {t.tags && t.tags.length > 0 && (
                    <div className="thought-tags">
                      {t.tags.map((tag, idx) => (
                        <span key={idx} className="thought-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default About;
