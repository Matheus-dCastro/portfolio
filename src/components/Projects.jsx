import { useState, useEffect } from "react";
import { getStoredProjects } from "../data/projectsData";
import { fetchWorks } from "../lib/supabaseService";
import { useLanguage } from "../context/useLanguage";

export default function Projects({ onOpenProject }) {
  const { t, lang } = useLanguage();
  const [projects, setProjects] = useState(() => getStoredProjects());
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    let isMounted = true;
    fetchWorks(false).then((loaded) => {
      if (isMounted && Array.isArray(loaded)) {
        setProjects(loaded);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const workCategories = [
    {
      id: "Profissional",
      title: t("projects.cat_prof_title"),
      icon: "",
      badgeClass: "cat-profissional",
      description: t("projects.cat_prof_desc")
    },
    {
      id: "Pessoal",
      title: t("projects.cat_pessoal_title"),
      icon: "",
      badgeClass: "cat-pessoal",
      description: t("projects.cat_pessoal_desc")
    },
    {
      id: "Acadêmico",
      title: t("projects.cat_academico_title"),
      icon: "",
      badgeClass: "cat-academico",
      description: t("projects.cat_academico_desc")
    }
  ];

  const profCount = projects.filter((p) => (p.category || "Profissional") === "Profissional").length;
  const pessoalCount = projects.filter((p) => p.category === "Pessoal").length;
  const academicoCount = projects.filter((p) => p.category === "Acadêmico").length;

  const visibleCategories =
    activeCategory === "all"
      ? workCategories
      : workCategories.filter((cat) => cat.id === activeCategory);

  return (
    <>
      <div className="section-divider-line"></div>
      <p className="section-tag">{t("projects.tag")}</p>
      <h2>
        {t("projects.title_prefix")}<span>{t("projects.title_highlight")}</span>
      </h2>

      {/* 3 Sessions Filter Bar */}
      {projects.length > 0 && (
        <div className="portfolio-category-bar">
          <button
            type="button"
            className={`category-filter-btn ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            {t("projects.filter_all")} ({projects.length})
          </button>
          {profCount > 0 && (
            <button
              type="button"
              className={`category-filter-btn ${activeCategory === "Profissional" ? "active" : ""}`}
              onClick={() => setActiveCategory("Profissional")}
            >
              {t("projects.filter_prof")} ({profCount})
            </button>
          )}
          {pessoalCount > 0 && (
            <button
              type="button"
              className={`category-filter-btn ${activeCategory === "Pessoal" ? "active" : ""}`}
              onClick={() => setActiveCategory("Pessoal")}
            >
              {t("projects.filter_pessoal")} ({pessoalCount})
            </button>
          )}
          {academicoCount > 0 && (
            <button
              type="button"
              className={`category-filter-btn ${activeCategory === "Acadêmico" ? "active" : ""}`}
              onClick={() => setActiveCategory("Acadêmico")}
            >
              {t("projects.filter_academico")} ({academicoCount})
            </button>
          )}
        </div>
      )}

      {/* Render category sessions */}
      <div className="works-sessions-container">
        {visibleCategories.map((cat) => {
          const catProjects = projects.filter(
            (p) => (p.category || "Profissional") === cat.id
          );

          if (catProjects.length === 0) return null;

          return (
            <div
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
                {catProjects.map((project) => {
                  const title = lang === "en" ? (project.titleEn || project.title) : (project.titlePt || project.title);
                  const desc = lang === "en"
                    ? (project.shortDescriptionEn || project.shortDescription || project.aboutContextEn || project.aboutContext)
                    : (project.shortDescriptionPt || project.shortDescription || project.aboutContextPt || project.aboutContext);

                  return (
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
                        {project.relatedArticleId && (
                          <span className="tag font-bold related-tag" title="Associated technical article">
                            {t("projects.badge_article")}
                          </span>
                        )}
                      </div>

                      <h3>{title}</h3>
                      <p>{desc}</p>

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
                            {t("projects.learn_more")} <span>→</span>
                          </button>
                        )}
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-arrow"
                          >
                            {t("projects.view_github")} <span>→</span>
                          </a>
                        )}
                        {project.demo && (
                          <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-arrow"
                          >
                            {t("projects.live_demo")} <span>→</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
