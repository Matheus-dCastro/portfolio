import { useEffect, useState } from "react";
import HeadSite from "./components/HeadSite";
import logoWolf from "./assets/img/wolf(2).png";
import Intereceses from "./components/Interecese";
import Contacts from "./components/Contacts";
import Rodape from "./components/Rodape";
import ArtGallery from "./components/ArtGallery";
import { getStoredThoughts, getStoredDrawings } from "./data/projectsData";
import { fetchThoughts, fetchDrawings } from "./lib/supabaseService";
import { useLanguage } from "./context/useLanguage";
import ShareButton from "./components/ShareButton";

// Capas
import capa1 from "./assets/img/1CF53B24-759E-48D5-B0C5-9CA7349A544E.webp";
import capa2 from "./assets/img/566644515_18081743411050733_8226103790257785455_n.webp";
import capa3 from "./assets/img/575981249_18291228211272949_514477677943118836_n.webp";
import capa4 from "./assets/img/584385202_18086409646964312_3912764164389240104_n.webp";
import capa5 from "./assets/img/Gama-4.webp";
import capa6 from "./assets/img/IMG_3091.webp";

function Hobbies({ onBackToHome, onOpenThought }) {
  const { t, lang } = useLanguage();
  const [thoughts, setThoughts] = useState(() => getStoredThoughts());
  const [drawings, setDrawings] = useState(() => getStoredDrawings());

  useEffect(() => {
    let isMounted = true;
    fetchThoughts(false).then((loaded) => {
      if (isMounted && Array.isArray(loaded)) {
        setThoughts(loaded);
      }
    });
    fetchDrawings(false).then((loaded) => {
      if (isMounted && Array.isArray(loaded)) {
        setDrawings(loaded);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const target = document.getElementById("interests");
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const dados = {
    nome: "Matheus",
    sobrenome: "de Castro",
    nomeCompleto: "Matheus de Castro",
    ano: "2026",
  };
  const Contatos = {
    instagram: "@MatheusdCastro._",
    instagram_link: "https://www.instagram.com/matheusdcastro._/",
    github: "@Matheus-dCastro",
    github_link: "https://github.com/Matheus-dCastro",
    email: "matheus.vsf.castro.25@gmail.com",
    linkedin: "linkedin.com/in/matheus-dcastro",
    linkedin_link: "https://www.linkedin.com/in/matheus-dcastro",
    portfolio_link: "https://matheusdecastro.com/",
    vscode_extension_link: "https://marketplace.visualstudio.com/items?itemName=Alomyr.obsidian-neon-110",
  };

  return (
    <div className="portfolio-app-root">
      <HeadSite lobo={logoWolf} isHobbies={true} onBackToHome={onBackToHome} />
      <main>
        <section id="interests">
          <Intereceses
            mensagem={t("hobbies.intro")}
            capa1={capa1}
            capa2={capa2}
            capa3={capa3}
            capa4={capa4}
            capa5={capa5}
            capa6={capa6}
          />
        </section>
        <section id="art-gallery">
          <ArtGallery artDrawings={drawings} />
        </section>
        <section id="thoughts" className="hobbies-thoughts-section">
          <div className="section-divider-line"></div>
          <p className="section-tag">{t("thoughts.tag")}</p>
          <h2>
            {t("thoughts.title_prefix")}<span>{t("thoughts.title_highlight")}</span>
          </h2>

          <div className="thoughts-mini-grid">
            {thoughts.map((item) => {
              const itemTitle = lang === "en" ? (item.titleEn || item.title) : (item.titlePt || item.title);
              const itemContent = lang === "en" ? (item.contentEn || item.content) : (item.contentPt || item.content);

              return (
                <article key={item.id} id={`thought-${item.id}`} className="thought-mini-card">
                  <div className="thought-card-top">
                    <h4>{itemTitle}</h4>
                    {item.updatedAt && <span className="thought-date">{item.updatedAt}</span>}
                  </div>
                  <div className="thought-body-text">
                    <p>{itemContent}</p>
                  </div>
                  <div className="thought-bottom-bar">
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenThought) {
                            onOpenThought(item);
                          } else {
                            window.location.href = `/?project=${encodeURIComponent(item.id)}`;
                          }
                        }}
                        className="thought-doc-link thought-saiba-mais-btn"
                        style={{
                          cursor: "pointer",
                          background: "rgba(139, 92, 246, 0.12)",
                          border: "1px solid rgba(139, 92, 246, 0.4)",
                          color: "#c4b5fd",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "0.82rem",
                          fontWeight: "600",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {lang === "en" ? "Read Full Thought ↗" : "Ler Completo (Saber Mais) ↗"}
                      </button>
                    </div>

                    <ShareButton
                      title={itemTitle}
                      text={itemContent}
                      url={`/?project=${encodeURIComponent(item.id)}`}
                    />
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="thought-tags">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="thought-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <section id="contact" className="contact-section">
        <Contacts
          instagram={Contatos.instagram}
          instagram_link={Contatos.instagram_link}
          github={Contatos.github}
          github_link={Contatos.github_link}
          email={Contatos.email}
          linkedin={Contatos.linkedin}
          linkedin_link={Contatos.linkedin_link}
        />
      </section>
      <footer>
        <Rodape
          ano={dados.ano}
          github_link={Contatos.github_link}
          linkedin_link={Contatos.linkedin_link}
        />
      </footer>
    </div>
  );
}

export default Hobbies;
