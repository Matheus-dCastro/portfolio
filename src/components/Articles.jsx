import { useState, useEffect } from "react";
import { getStoredArticles } from "../data/projectsData";
import { fetchArticles } from "../lib/supabaseService";

export default function Articles({ onOpenArticle }) {
  const [articles, setArticles] = useState(() => getStoredArticles());
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;
    fetchArticles(false).then((loaded) => {
      if (isMounted && Array.isArray(loaded)) {
        setArticles(loaded);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredArticles =
    activeFilter === "all"
      ? articles
      : articles.filter((a) => (a.category || "Acadêmico") === activeFilter);

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <>
      <div className="section-divider-line"></div>
      <p className="section-tag">Publicações & Estudos</p>
      <h2>
        Artigos <span>Técnicos</span>
      </h2>
      <p className="section-lead-text">
        Análises aprofundadas sobre Deep Learning, arquitetura de sistemas com FastAPI, 
        automação com Linux e intersecções entre arte e engenharia.
      </p>

      {/* Filter categories */}
      <div className="portfolio-category-bar">
        <button
          type="button"
          className={`category-filter-btn ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          Todos ({articles.length})
        </button>
        {["Acadêmico", "Profissional", "Pessoal"].map((cat) => {
          const count = articles.filter((a) => (a.category || "Acadêmico") === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              type="button"
              className={`category-filter-btn ${activeFilter === cat ? "active" : ""}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat === "Acadêmico" ? " " : cat === "Profissional" ? " " : " "}
              {cat} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid">
        {filteredArticles.map((article) => {
          const wordCount = article.content ? article.content.trim().split(/\s+/).length : 0;
          const readTime = Math.max(1, Math.ceil(wordCount / 180));

          return (
            <div key={article.id} className="project-card article-card">
              <div className="project-header">
                {article.tags?.slice(0, 3).map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className={`tag ${tIdx === 0 ? "font-bold" : ""}`}
                  >
                    {tag}
                  </span>
                ))}
                {article.contentType === "google-docs" && (
                  <span className="gdocs-badge" title="Disponível via Google Docs">
                    🌐 Docs
                  </span>
                )}
                {article.contentType === "pdf" && (
                  <span className="pdf-badge" title="Disponível via PDF">
                    PDF
                  </span>
                )}
                {article.relatedProjectId && (
                  <span className="related-badge" title="Possui projeto prático associado">
                    💻 Projeto
                  </span>
                )}
              </div>

              <h3>{article.title}</h3>
              <p>{article.shortDescription || article.aboutContext || "Sem resumo disponível."}</p>

              <div className="article-meta-row">
                <span className="article-read-pill">⏱ ~{readTime} min de leitura</span>
                {article.updatedAt && (
                  <span className="article-date-pill">📅 {article.updatedAt}</span>
                )}
              </div>

              <div className="project-footer">
                <button
                  type="button"
                  className="btn-learn-more"
                  onClick={() => onOpenArticle && onOpenArticle(article)}
                >
                  Ler Artigo Completo →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
