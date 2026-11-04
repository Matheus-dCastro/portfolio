import { useState, useEffect } from "react";
import HeadSite from "./components/HeadSite";
import Perfil from "./components/Perfil";

import "./style.css";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Articles from "./components/Articles";
import Contacts from "./components/Contacts";
import About from "./components/About";
import logoWolf from "./assets/img/wolf(2).png";
import fotoAlomyr from "./assets/img/alomyr.jpeg";
import cvMatheus from "./docs/Matheus Vinicius Silva Freire de Castro.pdf";
import Rodape from "./components/Rodape";
import { fetchWorks, fetchArticles, fetchExperiences } from "./lib/supabaseService";
import { getStoredProjects, getStoredArticles, getStoredExperiences } from "./data/projectsData";
import { useLanguage } from "./context/useLanguage";

function Home({ onNavigateToHobbies, onNavigateToLinks, onBackToHome, onOpenProject }) {
  const { t } = useLanguage();
  const [experiences, setExperiences] = useState(() => getStoredExperiences());
  const [projectsCount, setProjectsCount] = useState(() => getStoredProjects().length);
  const [articlesCount, setArticlesCount] = useState(() => getStoredArticles().length);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState("projects"); // 'projects' | 'articles'

  useEffect(() => {
    fetchExperiences().then((loaded) => {
      if (Array.isArray(loaded)) setExperiences(loaded);
    });
    fetchWorks(false).then((loaded) => {
      if (Array.isArray(loaded)) setProjectsCount(loaded.length);
    });
    fetchArticles(false).then((loaded) => {
      if (Array.isArray(loaded)) {
        setArticlesCount(loaded.length);
        if (projectsCount === 0 && loaded.length > 0) {
          setActiveShowcaseTab("articles");
        }
      }
    });
  }, [projectsCount]);

  const dados = {
    nome: "Matheus",
    sobrenome: "de Castro",
    nomeCompleto: "Matheus de Castro",
    ano: "2026",
  };
  const imageWolf = logoWolf;
  const descriptionPerfil = t("hero.subtitle");
  const fotoPerfil = fotoAlomyr;
  const cv = cvMatheus;
  const descriptionP1About = t("about.p1");
  const descriptionP2About = t("about.p2");

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
      <main>
        <HeadSite
          nome={dados.nome}
          sobrenome={dados.sobrenome}
          lobo={imageWolf}
          isHobbies={false}
          onBackToHome={onBackToHome}
          onNavigateToLinks={onNavigateToLinks}
          description={descriptionPerfil}
        />
        <Perfil
          nomeCompleto={dados.nomeCompleto}
          description={descriptionPerfil}
          foto={fotoPerfil}
          cv={cv}
        />
        <section id="skills" className="skills-section">
          <Skills />
        </section>
        <section id="experience" className="experience-section">
          <Experience expData={experiences} />
        </section>

        {/* Browser-style Tab Showcase (Selected Works vs Technical Articles) */}
        {(projectsCount > 0 || articlesCount > 0) && (
          <section id="projects" className="Projects-section browser-showcase-container">
            {projectsCount > 0 && articlesCount > 0 && (
              <div className="browser-tabs-header">
                <button
                  type="button"
                  className={`browser-tab-button ${activeShowcaseTab === "projects" ? "active" : ""}`}
                  onClick={() => setActiveShowcaseTab("projects")}
                >
                  <span>{t("showcase.tab_projects")}</span>
                  <span className="browser-tab-pill">{projectsCount}</span>
                </button>
                <button
                  type="button"
                  className={`browser-tab-button ${activeShowcaseTab === "articles" ? "active" : ""}`}
                  onClick={() => setActiveShowcaseTab("articles")}
                >
                  <span>{t("showcase.tab_articles")}</span>
                  <span className="browser-tab-pill">{articlesCount}</span>
                </button>
              </div>
            )}

            {activeShowcaseTab === "projects" && projectsCount > 0 && (
              <Projects onOpenProject={onOpenProject} />
            )}

            {activeShowcaseTab === "articles" && articlesCount > 0 && (
              <div id="articles">
                <Articles onOpenArticle={onOpenProject} />
              </div>
            )}
          </section>
        )}
        <section id="about" className="about-section">
          <About
            descriptionP1={descriptionP1About}
            descriptionP2={descriptionP2About}
            onAction={onNavigateToHobbies}
          />
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

export default Home;
