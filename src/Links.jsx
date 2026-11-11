import { useState, useEffect } from "react";
import HeadSite from "./components/HeadSite";
import Rodape from "./components/Rodape";
import fotoAlomyr from "./assets/img/alomyr.jpeg";
import logoWolf from "./assets/img/wolf(2).png";
import "./style.css";
import { useLanguage } from "./context/useLanguage";
import { getStoredProfileConfig } from "./data/projectsData";
import { fetchProfileConfig } from "./lib/supabaseService";

function Links({ onBackToHome }) {
  const { t, lang } = useLanguage();
  const [showToast, setShowToast] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(() => getStoredProfileConfig()?.photoUrl || fotoAlomyr);

  useEffect(() => {
    fetchProfileConfig().then((cfg) => {
      if (cfg?.photoUrl) setProfilePhoto(cfg.photoUrl);
    });
  }, []);

  const handleEmailClick = (e, email) => {
    e.preventDefault();
    navigator.clipboard.writeText(email);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const dados = {
    nome: "Matheus",
    sobrenome: "de Castro",
    ano: "2026",
  };
  const imageWolf = logoWolf;
  const descriptionPerfil = t("hero.subtitle");
  const fotoPerfil = profilePhoto;
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
    <>
      <HeadSite
        nome={dados.nome}
        sobrenome={dados.sobrenome}
        lobo={imageWolf}
        isLinks={true}
        onBackToHome={onBackToHome}
        description={descriptionPerfil}
      />

      <main className="links-page-main">
        <section className="links-section">
          <div className="links-profile">
            <img src={fotoPerfil} alt="Perfil" className="profile-pic links-pic" />
            <h2>
              {t("links.title_prefix")}<span>{t("links.title_highlight")}</span>
            </h2>
            <p className="links-subtitle">{t("links.subtitle")}</p>
          </div>

          <div className="links-container">
            <a href={Contatos.github_link} target="_blank" rel="noreferrer" className="link-item">
              <div className="link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </div>
              <span className="link-text">GitHub</span>
            </a>

            <a href={Contatos.portfolio_link} target="_blank" rel="noreferrer" className="link-item">
              <div className="link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <span className="link-text">{t("links.portfolio")}</span>
            </a>

            <a href={Contatos.linkedin_link} target="_blank" rel="noreferrer" className="link-item">
              <div className="link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </div>
              <span className="link-text">LinkedIn</span>
            </a>

            <a href={`mailto:${Contatos.email}`} className="link-item" onClick={(e) => handleEmailClick(e, Contatos.email)}>
              <div className="link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <span className="link-text">Email</span>
            </a>

            <a href={Contatos.vscode_extension_link} target="_blank" rel="noreferrer" className="link-item">
              <div className="link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 17l6 4 10-9-10-9-6 4 6 5-6 5z"></path>
                </svg>
              </div>
              <span className="link-text">{lang === "en" ? "VS Code Extension" : "Extensão VS Code"}</span>
            </a>
          </div>
        </section>
      </main>

      <footer>
        <Rodape
          ano={dados.ano}
          github_link={Contatos.github_link}
          linkedin_link={Contatos.linkedin_link}
        />
      </footer>
      
      {showToast && (
        <div className="toast-notification">
          {t("contacts.toast")}
        </div>
      )}
    </>
  );
}

export default Links;
