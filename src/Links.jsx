import { useState } from "react";
import HeadSite from "./components/HeadSite";
import Rodape from "./components/Rodape";
import fotoAlomyr from "./assets/img/alomyr.jpeg";
import logoWolf from "./assets/img/wolf(2).png";
import "./style.css";

function Links({ onBackToHome }) {
  const [showToast, setShowToast] = useState(false);

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
  const descriptionPerfil =
    "IT Technician — IFRN. Undergraduate student in Information Technology (BTI) at UFRN.";
  const fotoPerfil = fotoAlomyr;
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
              Meus <span>Links</span>
            </h2>
            <p className="links-subtitle">Conecte-se comigo através das minhas redes</p>
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
              <span className="link-text">Portfólio</span>
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
              <span className="link-text">E-mail</span>
            </a>

            <a href={Contatos.instagram_link} target="_blank" rel="noreferrer" className="link-item">
              <div className="link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <span className="link-text">Instagram</span>
            </a>

            <a href={Contatos.vscode_extension_link} target="_blank" rel="noreferrer" className="link-item">
              <div className="link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </div>
              <span className="link-text">Extensão VSCode</span>
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
          O email foi copiado
        </div>
      )}
    </>
  );
}

export default Links;
