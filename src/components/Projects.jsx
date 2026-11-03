import { useState } from "react";
import { getStoredProjects } from "../data/projectsData";

const WORK_CATEGORIES = [
  {
    id: "Profissional",
    title: "Profissional & Corporativo",
    icon: "🏢",
    badgeClass: "cat-profissional",
    description: "Sistemas corporativos, arquiteturas escaláveis e soluções em produção desenvolvidas para empresas e clientes."
  },
  {
    id: "Pessoal",
    title: "Projetos Pessoais & Inovações",
    icon: "🚀",
    badgeClass: "cat-pessoal",
    description: "Projetos autorais, ferramentas de produtividade, design systems e extensões públicas."
  },
  {
    id: "Acadêmico",
    title: "Acadêmico & Pesquisa Científica",
    icon: "🎓",
    badgeClass: "cat-academico",
    description: "Pesquisas na UFRN/IFRN em Machine Learning, Deep Learning, Visão Computacional e algoritmos complexos."
  }
];

function Projects({ onOpenProject }) {
  const [projects] = useState(() => getStoredProjects());
  const [activeCategory, setActiveCategory] = useState("all");

  const profCount = projects.filter((p) => (p.category || "Profissional") === "Profissional").length;
  const pessoalCount = projects.filter((p) => p.category === "Pessoal").length;
  const academicoCount = projects.filter((p) => p.category === "Acadêmico").length;

  const visibleCategories =
    activeCategory === "all"
      ? WORK_CATEGORIES
      : WORK_CATEGORIES.filter((cat) => cat.id === activeCategory);

  return (
    <>
      <div className="section-divider-line"></div>
      <p className="section-tag">Selected Portfolio</p>
      <h2>
        Selected <span>Works</span>
      </h2>

      {/* 3 Sessions Filter Bar */}
      <div className="portfolio-category-bar">
        <button
          type="button"
          className={`category-filter-btn ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          Todos ({projects.length})
        </button>
        <button
          type="button"
          className={`category-filter-btn ${activeCategory === "Profissional" ? "active" : ""}`}
          onClick={() => setActiveCategory("Profissional")}
        >
          🏢 Profissional ({profCount})
        </button>
        <button
          type="button"
          className={`category-filter-btn ${activeCategory === "Pessoal" ? "active" : ""}`}
          onClick={() => setActiveCategory("Pessoal")}
        >
          🚀 Pessoal ({pessoalCount})
        </button>
        <button
          type="button"
          className={`category-filter-btn ${activeCategory === "Acadêmico" ? "active" : ""}`}
          onClick={() => setActiveCategory("Acadêmico")}
        >
          🎓 Acadêmico ({academicoCount})
        </button>
      </div>

      {/* Render the 3 category sessions (shown all together when 'all', or filtered individually) */}
      <div className="works-sessions-container">
        {visibleCategories.map((cat) => {
          const catProjects = projects.filter(
            (p) => (p.category || "Profissional") === cat.id
          );

          if (catProjects.length === 0) return null;

          return (
            <section
              key={cat.id}
              id={`works-${cat.id.toLowerCase()}`}
              className="works-category-section"
            >
              <div className="works-category-header">
                <div className="works-category-title-group">
                  <span className="works-category-icon">{cat.icon}</span>
                  <div>
                    <h3 className="works-category-title">
                      {cat.title}{" "}
                      <span className="works-count-pill">({catProjects.length})</span>
                    </h3>
                    <p className="works-category-desc">{cat.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid">
                {catProjects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="project-header">
                      {project.tags?.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className={`tag ${tIdx === 1 ? "font-bold" : ""}`}
                        >
                          {tag}
                        </span>
                      ))}
                      {project.contentType === "google-docs" && (
                        <span className="tag font-bold gdocs-badge">Google Docs</span>
                      )}
                      {project.contentType === "pdf" && (
                        <span className="tag font-bold pdf-badge">PDF</span>
                      )}
                    </div>

                    <h3>{project.title}</h3>
                    <p>{project.shortDescription || project.aboutContext}</p>

                    <div className="project-links">
                      {onOpenProject && (
                        <button
                          type="button"
                          className="link-arrow highlight"
                          onClick={() => onOpenProject(project)}
                          style={{
                            background: "none",
                            border: "none",
                            fontFamily: "inherit",
                            fontSize: "inherit",
                            cursor: "pointer",
                            padding: 0
                          }}
                        >
                          Saber mais <span>→</span>
                        </button>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-arrow"
                        >
                          View GitHub <span>→</span>
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-arrow"
                        >
                          Live Demo <span>→</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

export default Projects;
