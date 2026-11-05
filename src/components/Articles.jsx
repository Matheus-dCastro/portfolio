import { useState, useEffect } from "react";
import { getStoredArticles } from "../data/projectsData";
import { fetchArticles } from "../lib/supabaseService";
import { useLanguage } from "../context/useLanguage";
import ShareButton from "./ShareButton";

export default function Articles({ onOpenArticle }) {
  const { t, lang } = useLanguage();
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

  const categoryLabels = {
    Acadêmico: lang === "en" ? "Academic" : "Acadêmico",
    Profissional: lang === "en" ? "Professional" : "Profissional",
    Pessoal: lang === "en" ? "Personal" : "Pessoal"
  };

  return (
    <>
      <div className="section-divider-line"></div>
      <p className="section-tag">{t("articles.tag")}</p>
      <h2>
        {t("articles.title_prefix")}<span>{t("articles.title_highlight")}</span>
      </h2>
      <p className="section-lead-text">
        {t("articles.lead_text")}
      </p>

      {/* Filter categories */}
      <div className="portfolio-category-bar">
        <button
          type="button"
          className={`category-filter-btn ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          {t("articles.filter_all")} ({articles.length})
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
              {categoryLabels[cat] || cat} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid">
        {filteredArticles.map((article) => {
          const wordCount = article.content ? article.content.trim().split(/\s+/).length : 0;
          const readTime = Math.max(1, Math.ceil(wordCount / 180));
          const title = lang === "en" ? (article.titleEn || article.title) : (article.titlePt || article.title);
          const desc = lang === "en"
            ? (article.shortDescriptionEn || article.shortDescription || article.aboutContextEn || article.aboutContext || t("articles.no_summary"))
            : (article.shortDescriptionPt || article.shortDescription || article.aboutContextPt || article.aboutContext || t("articles.no_summary"));

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
                  <span className="gdocs-badge" title="Google Docs">
                    Docs
                  </span>
                )}
                {article.contentType === "pdf" && (
                  <span className="pdf-badge" title="PDF">
                    PDF
                  </span>
                )}
                {article.relatedProjectId && (
                  <span className="related-badge" title="Associated project">
                    {t("articles.badge_project")}
                  </span>
                )}
              </div>

              <h3>{title}</h3>
              <p>{desc}</p>

              <div className="article-meta-row">
                <span className="article-read-pill">~{readTime} {t("articles.read_time")}</span>
                {article.updatedAt && (
                  <span className="article-date-pill">{article.updatedAt}</span>
                )}
              </div>

              {/* Direct links for PT and EN articles if configured */}
              {(article.googleDocsUrlPt || article.googleDocsUrlEn || article.googleDocsUrl || article.pdfUrl) && (
                <div className="article-direct-links" style={{ marginTop: "10px" }}>
                  {article.googleDocsUrlPt && (
                    <a
                      href={article.googleDocsUrlPt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-lang-badge-btn pt"
                      title={t("articles.open_docs_pt")}
                    >
                      Docs (PT) ↗
                    </a>
                  )}
                  {article.googleDocsUrlEn && (
                    <a
                      href={article.googleDocsUrlEn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-lang-badge-btn en"
                      title={t("articles.open_docs_en")}
                    >
                      Docs (EN) ↗
                    </a>
                  )}
                  {!article.googleDocsUrlPt && !article.googleDocsUrlEn && article.googleDocsUrl && (
                    <a
                      href={article.googleDocsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-lang-badge-btn"
                    >
                      Docs ↗
                    </a>
                  )}
                  {article.pdfUrl && (
                    <a
                      href={article.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="article-lang-badge-btn"
                    >
                      PDF ↗
                    </a>
                  )}
                </div>
              )}

              <div className="article-actions-row">
                {onOpenArticle && (
                  <button
                    type="button"
                    className="link-arrow highlight"
                    onClick={() => onOpenArticle(article)}
                    style={{
                      background: "none",
                      border: "none",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    {t("articles.view_details") || t("articles.read_full")} <span>→</span>
                  </button>
                )}

                <ShareButton
                  title={title}
                  text={desc}
                  url={`/?project=${encodeURIComponent(article.id)}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
