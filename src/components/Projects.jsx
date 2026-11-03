import { useState } from "react";
import { getStoredProjects } from "../data/projectsData";

function Projects({ onOpenProject }) {
  const [projects] = useState(() => getStoredProjects());
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => (p.category || "Profissional") === activeCategory);

  const profCount = projects.filter((p) => (p.category || "Profissional") === "Profissional").length;
  const pessoalCount = projects.filter((p) => p.category === "Pessoal").length;
  const academicoCount = projects.filter((p) => p.category === "Acadêmico").length;

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

      <div className="grid">
        {filteredProjects.map((project) => (
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
            </div>
            <h3>{project.title}</h3>
            <p>
              {project.shortDescription || project.aboutContext}
            </p>
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
    </>
  );
}

export default Projects;
