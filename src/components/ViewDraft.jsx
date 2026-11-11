import { useState } from "react";
import {
  getStoredProjects,
  getStoredArticles,
  getStoredThoughts,
  convertGoogleDocsToEmbedUrl
} from "../data/projectsData";
import { getStoredBlogPosts } from "../data/blogData";
import { useLanguage } from "../context/useLanguage";
import LanguageSwitcher from "./LanguageSwitcher";
import ShareButton from "./ShareButton";
import CategoryIcon from "./CategoryIcon";
import "./ViewDraft.css";

function getInitialProject(propProject) {
  if (propProject) return propProject;
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("project") || urlParams.get("id");
  const allItems = [
    ...getStoredProjects(),
    ...getStoredArticles(),
    ...getStoredThoughts()
  ];

  if (projectId) {
    const found = allItems.find((p) => p.id === projectId);
    if (found) return found;
  }

  return allItems.length > 0 ? allItems[0] : null;
}

export default function ViewDraft({ project: propProject, onBackToHome, onSelectProject, onNavigateToBlogPost }) {
  const { t, lang } = useLanguage();
  const [internalProject, setInternalProject] = useState(() => getInitialProject(propProject));
  const [activeContentTab, setActiveContentTab] = useState("auto"); // 'auto' | 'readme' | 'gdocs' | 'pdf'
  const [inlineQuestion, setInlineQuestion] = useState("");

  const project = propProject || internalProject;

  if (!project) {
    return (
      <div className="view-loading-screen">
        <p>{t("view.loading")}</p>
        <button className="back-button" onClick={onBackToHome}>
          {t("view.back_to_projects")}
        </button>
      </div>
    );
  }

  const isThought = Boolean(
    project.id?.startsWith("th-") ||
    project.id?.startsWith("thought-") ||
    getStoredThoughts().some((th) => th.id === project.id)
  );

  const isArticle = !isThought && Boolean(
    project.relatedProjectId ||
    project.id?.startsWith("art-") ||
    getStoredArticles().some((a) => a.id === project.id)
  );

  const activeCollection = isThought
    ? getStoredThoughts()
    : isArticle
    ? getStoredArticles()
    : getStoredProjects();
  const currentIndex = activeCollection.findIndex((p) => p.id === project.id);
  const prevProject = currentIndex > 0 ? activeCollection[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < activeCollection.length - 1
      ? activeCollection[currentIndex + 1]
      : null;

  const projectTitle = lang === "en" ? (project.titleEn || project.title) : (project.titlePt || project.title);
  const projectDesc = lang === "en"
    ? (project.shortDescriptionEn || project.shortDescription || project.aboutContextEn || project.aboutContext || t("view.default_context"))
    : (project.shortDescriptionPt || project.shortDescription || project.aboutContextPt || project.aboutContext || t("view.default_context"));
  const projectContent = lang === "en" ? (project.contentEn || project.content) : (project.contentPt || project.content);

  const activeGDocs = lang === "en"
    ? (project.googleDocsUrlEn || project.googleDocsUrl)
    : (project.googleDocsUrlPt || project.googleDocsUrl);

  const hasGDocs = Boolean(activeGDocs || project.googleDocsUrl || project.googleDocsUrlPt || project.googleDocsUrlEn);
  const hasPdf = Boolean(project.pdfUrl);
  const hasMarkdown = Boolean(projectContent);

  // Determine current active format
  const currentFormat =
    activeContentTab !== "auto"
      ? activeContentTab
      : project.contentType === "google-docs" && hasGDocs
      ? "gdocs"
      : project.contentType === "pdf" && hasPdf
      ? "pdf"
      : "markdown";

  const embedGDocsUrl = convertGoogleDocsToEmbedUrl(activeGDocs || project.googleDocsUrl);

  const wordCount = projectContent ? projectContent.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  const linkedArticle = project.relatedArticleId
    ? getStoredArticles().find((a) => a.id === project.relatedArticleId)
    : null;
  const linkedProject = project.relatedProjectId
    ? getStoredProjects().find((p) => p.id === project.relatedProjectId)
    : null;
  const linkedBlogPost = getStoredBlogPosts().find(
    (b) =>
      b.relatedProjectId === project.id ||
      b.relatedArticleId === project.id ||
      b.id === project.relatedArticleId ||
      b.id === project.relatedBlogPostId ||
      (project.relatedBlogPostId && b.id === project.relatedBlogPostId)
  );

  const isFromAdmin = typeof window !== "undefined" && window.location.search.includes("from=admin");

  const itemTypeName = isThought
    ? (lang === "en" ? "thought" : "pensamento")
    : isArticle
    ? (lang === "en" ? "article" : "artigo")
    : (lang === "en" ? "project" : "projeto");

  const contextualQuestions = isThought
    ? [
        lang === "en" ? "What is the central insight?" : "Qual é a reflexão central deste texto?",
        lang === "en" ? "How does this connect to tech vision?" : "Como se relaciona com a visão técnica?",
        lang === "en" ? "What inspired this reflection?" : "O que motivou e inspirou este ensaio?"
      ]
    : isArticle
    ? [
        lang === "en" ? "What is the core thesis?" : "Qual é a tese principal deste artigo?",
        lang === "en" ? "Which methodologies were used?" : "Quais metodologias foram abordadas?",
        lang === "en" ? "Provide an executive summary." : "Faça um resumo executivo dos pontos-chave."
      ]
    : [
        lang === "en" ? "How was this architected?" : "Como este projeto foi arquitetado?",
        lang === "en" ? "What stack and models were used?" : "Quais tecnologias e modelos foram usados?",
        lang === "en" ? "What practical metrics were achieved?" : "Quais resultados e métricas foram alcançados?"
      ];

  const handleAskAlomyr = (questionText) => {
    window.dispatchEvent(
      new CustomEvent("open-alomyr-chat", {
        detail: {
          prompt: questionText || ""
        }
      })
    );
  };

  return (
    <div className="view-detail-page">
      {/* Top Header Bar - Integrated with system */}
      <nav className="view-top-header">
        <button
          className="back-to-projects-btn"
          onClick={() => onBackToHome && onBackToHome(isThought ? "thoughts" : isArticle ? "articles" : "projects")}
        >
          <span className="arrow">←</span>{" "}
          {isFromAdmin
            ? (lang === "en" ? "Back to 4dm1n Editor" : "Voltar ao Editor 4dm1n")
            : isThought
            ? t("view.back_to_thoughts")
            : isArticle
            ? t("view.back_to_articles")
            : t("view.back_to_projects")}
        </button>

        <div className="header-actions-group">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn github-action"
            >
              <span>{t("view.github_repo")}</span>
              <span className="external-arrow">↗</span>
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn demo-action"
            >
              <span>{t("view.live_demo")}</span>
              <span className="external-arrow">↗</span>
            </a>
          )}
          {/* Support bilingual Docs links if both are available */}
          {project.googleDocsUrlPt && (
            <a
              href={project.googleDocsUrlPt}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn gdocs-action"
              title="Docs em Português"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>Docs (PT)</span>
              <span className="external-arrow">↗</span>
            </a>
          )}
          {project.googleDocsUrlEn && (
            <a
              href={project.googleDocsUrlEn}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn gdocs-action"
              title="Docs in English"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>Docs (EN)</span>
              <span className="external-arrow">↗</span>
            </a>
          )}
          {!project.googleDocsUrlPt && !project.googleDocsUrlEn && hasGDocs && (
            <a
              href={activeGDocs || project.googleDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn gdocs-action"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>{t("view.gdocs")}</span>
              <span className="external-arrow">↗</span>
            </a>
          )}
          {hasPdf && (
            <a
              href={project.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn pdf-action"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>{t("view.pdf_doc")}</span>
              <span className="external-arrow">↗</span>
            </a>
          )}

          <ShareButton
            title={projectTitle}
            text={projectDesc}
            url={`/?project=${encodeURIComponent(project.id)}`}
            className="action-btn share-action"
          />

          <LanguageSwitcher />
        </div>
      </nav>

      {/* Main Container */}
      <main className="view-main-article">
        {/* Article Header */}
        <div className="article-header">
          <div className="article-badges-row">
            <span
              className={`category-badge cat-${(isThought ? "pessoal" : project.category)
                ?.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <CategoryIcon category={isThought ? "Pessoal" : project.category} size={13} />
              {isThought
                ? (lang === "en" ? "Thought & Reflection" : "Pensamento & Reflexão")
                : project.category === "Profissional"
                ? (lang === "en" ? "Professional" : "Profissional")
                : project.category === "Pessoal"
                ? (lang === "en" ? "Personal" : "Pessoal")
                : project.category === "Acadêmico"
                ? (lang === "en" ? "Academic" : "Acadêmico")
                : (project.category || "Project")}
            </span>

            {project.tags?.map((tag, idx) => (
              <span key={idx} className="tech-badge">
                {tag}
              </span>
            ))}

            <span className="read-time-pill">
              ~{readingTime} {t("view.read_time")}
            </span>
          </div>

          <h1 className="article-main-title">{projectTitle}</h1>

          {/* AI Context / Synopsis Callout */}
          <div className="ai-context-callout">
            <div className="callout-header">
              <span className="callout-icon"></span>
              <span className="callout-label">{t("view.context_label")}</span>
            </div>
            <p className="callout-body">
              {projectDesc}
            </p>
          </div>

          {/* Attached / Linked Item Banner (Bidirectional Project <-> Article) */}
          {linkedArticle && (
            <div className="linked-item-banner">
              <div className="linked-banner-icon"></div>
              <div className="linked-banner-info">
                <span className="linked-banner-tag">{t("view.attached_article_tag")}</span>
                <h4 className="linked-banner-title">
                  {lang === "en" ? (linkedArticle.titleEn || linkedArticle.title) : (linkedArticle.titlePt || linkedArticle.title)}
                </h4>
                <p className="linked-banner-desc">
                  {lang === "en"
                    ? (linkedArticle.shortDescriptionEn || linkedArticle.shortDescription)
                    : (linkedArticle.shortDescriptionPt || linkedArticle.shortDescription)}
                </p>
              </div>
              <button
                type="button"
                className="btn-open-linked"
                onClick={() => onSelectProject && onSelectProject(linkedArticle)}
              >
                {t("view.read_attached_article")}
              </button>
            </div>
          )}

          {linkedProject && (
            <div className="linked-item-banner">
              <div className="linked-banner-icon"></div>
              <div className="linked-banner-info">
                <span className="linked-banner-tag">{t("view.attached_project_tag")}</span>
                <h4 className="linked-banner-title">
                  {lang === "en" ? (linkedProject.titleEn || linkedProject.title) : (linkedProject.titlePt || linkedProject.title)}
                </h4>
                <p className="linked-banner-desc">
                  {lang === "en"
                    ? (linkedProject.shortDescriptionEn || linkedProject.shortDescription)
                    : (linkedProject.shortDescriptionPt || linkedProject.shortDescription)}
                </p>
              </div>
              <button
                type="button"
                className="btn-open-linked"
                onClick={() => onSelectProject && onSelectProject(linkedProject)}
              >
                {t("view.view_attached_project")}
              </button>
            </div>
          )}
        </div>

        {/* Content Type Selector (if multiple formats available) */}
        {(hasGDocs || hasPdf) && (
          <div className="content-format-switcher">
            <span className="switcher-title">{t("view.view_as")}</span>
            <div className="switcher-buttons">
              {hasMarkdown && (
                <button
                  type="button"
                  className={`format-tab-btn ${currentFormat === "markdown" ? "active" : ""}`}
                  onClick={() => setActiveContentTab("markdown")}
                >
                  {t("view.tab_markdown")}
                </button>
              )}
              {hasGDocs && (
                <button
                  type="button"
                  className={`format-tab-btn ${currentFormat === "gdocs" ? "active" : ""}`}
                  onClick={() => setActiveContentTab("gdocs")}
                >
                  {t("view.tab_gdocs")}
                </button>
              )}
              {hasPdf && (
                <button
                  type="button"
                  className={`format-tab-btn ${currentFormat === "pdf" ? "active" : ""}`}
                  onClick={() => setActiveContentTab("pdf")}
                >
                  {t("view.tab_pdf")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* CONTENT RENDERER */}
        <div className="article-body-area">
          {/* Format 1: Google Docs Embed */}
          {currentFormat === "gdocs" && embedGDocsUrl && (
            <div className="gdocs-reader-wrapper">
              <div className="reader-info-bar">
                <span>{t("view.gdocs_synced")}</span>
                <a
                  href={project.googleDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-fullscreen-link"
                >
                  {t("view.open_gdocs")}
                </a>
              </div>
              <iframe
                src={embedGDocsUrl}
                title="Google Docs Reader"
                className="gdocs-full-iframe"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Format 2: PDF Viewer */}
          {currentFormat === "pdf" && project.pdfUrl && (
            <div className="pdf-reader-wrapper">
              <div className="reader-info-bar">
                <span>{t("view.pdf_viewer_label")}</span>
                <a
                  href={project.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-fullscreen-link"
                >
                  {t("view.download_open_tab")}
                </a>
              </div>
              <iframe
                src={project.pdfUrl}
                title="PDF Document"
                className="pdf-full-iframe"
                frameBorder="0"
              ></iframe>
            </div>
          )}

          {/* Format 3: Rich Markdown */}
          {currentFormat === "markdown" && (
            <div className="markdown-reader-container">
              <RenderRichMarkdown content={projectContent} />
            </div>
          )}
        </div>

        {/* Tech Stack Visual Pills Section */}
        {project.tags && project.tags.length > 0 && (
          <section className="tech-stack-section">
            <h3 className="section-subtitle">{t("view.applied_tech")}</h3>
            <div className="tags-grid">
              {project.tags.map((tag, tIdx) => (
                <div key={tIdx} className="tech-card-pill">
                  <span className="dot">•</span>
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Linked Blog Post Banner (Positioned right before Alomyr Integration) */}
        {linkedBlogPost && (
          <div className="linked-item-banner blog-linked-banner bottom-highlight">
            <div className="linked-banner-icon" style={{ borderColor: "rgba(139, 92, 246, 0.35)", color: "#c084fc", background: "rgba(139, 92, 246, 0.15)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <div className="linked-banner-info">
              <span className="linked-banner-tag" style={{ color: "#c084fc" }}>
                {lang === "en" ? "Deep-Dive Blog Post" : "Artigo Completo no Blog"}
              </span>
              <h4 className="linked-banner-title">
                {lang === "en" ? (linkedBlogPost.titleEn || linkedBlogPost.titlePt) : linkedBlogPost.titlePt}
              </h4>
              <p className="linked-banner-desc">
                {lang === "en"
                  ? (linkedBlogPost.summaryEn || linkedBlogPost.summaryPt)
                  : linkedBlogPost.summaryPt}
              </p>
            </div>
            <button
              type="button"
              className="btn-open-linked"
              style={{ borderColor: "#8b5cf6", background: "rgba(139, 92, 246, 0.2)", color: "#fff" }}
              onClick={() => {
                if (onNavigateToBlogPost) {
                  onNavigateToBlogPost(linkedBlogPost);
                } else {
                  window.location.href = `${(linkedBlogPost.channel || "tech") === "alomyr" ? "/blog/alomyr" : "/blog"}?post=${encodeURIComponent(linkedBlogPost.id)}`;
                }
              }}
            >
              {lang === "en" ? "Read Full Article ↗" : "Ler Matéria no Blog ↗"}
            </button>
          </div>
        )}

        {/* Contextual Alomyr Assistant Banner - Same structure & CSS as linked-item-banner to prevent responsive breaking */}
        <div className="linked-item-banner alomyr-linked-banner bottom-highlight">
          <div className="linked-banner-icon alomyr-banner-icon" style={{ borderColor: "rgba(139, 92, 246, 0.4)", color: "#c084fc", background: "rgba(139, 92, 246, 0.15)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0 }}>
            <img src="/wolf(2).png" alt="Alomyr" style={{ width: "28px", height: "28px", objectFit: "contain" }} />
          </div>
          <div className="linked-banner-info">
            <span className="linked-banner-tag" style={{ color: "#c084fc" }}>
              {t("view.alomyr_badge") || "Assistente IA Alomyr"}
            </span>
            <h4 className="linked-banner-title">
              {t("view.alomyr_title").replace("{type}", itemTypeName)}
            </h4>
            <p className="linked-banner-desc">
              {t("view.alomyr_subtitle") || "Dúvidas técnicas, métricas ou detalhes de implementação sobre este conteúdo."}
            </p>
          </div>
          <button
            type="button"
            className="btn-open-linked"
            style={{ borderColor: "#8b5cf6", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.4))", color: "#fff", whiteSpace: "nowrap" }}
            onClick={() => handleAskAlomyr(`[Sobre o ${itemTypeName} "${projectTitle}"]: Olá Alomyr, pode me apresentar os pontos centrais e diferenciais técnicos deste conteúdo?`)}
          >
            {t("view.alomyr_open_btn") || "Perguntar ao Alomyr 💬"}
          </button>
        </div>

        {/* Next / Prev Project Navigation - Minimalist Arrow Design */}
        <section className="minimal-navigation-footer">
          <div className="minimal-nav-col prev">
            {prevProject && (
              <button
                type="button"
                className="minimal-nav-arrow-btn prev-btn"
                onClick={() => {
                  if (onSelectProject) onSelectProject(prevProject);
                  else setInternalProject(prevProject);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                title={lang === "en" ? `Previous: ${prevProject.titleEn || prevProject.title}` : `Anterior: ${prevProject.titlePt || prevProject.title}`}
                aria-label={lang === "en" ? `Previous: ${prevProject.titleEn || prevProject.title}` : `Anterior: ${prevProject.titlePt || prevProject.title}`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span className="minimal-nav-tooltip">
                  {lang === "en" ? (prevProject.titleEn || prevProject.title) : (prevProject.titlePt || prevProject.title)}
                </span>
              </button>
            )}
          </div>

          <div className="minimal-nav-col next">
            {nextProject && (
              <button
                type="button"
                className="minimal-nav-arrow-btn next-btn"
                onClick={() => {
                  if (onSelectProject) onSelectProject(nextProject);
                  else setInternalProject(nextProject);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                title={lang === "en" ? `Next: ${nextProject.titleEn || nextProject.title}` : `Próximo: ${nextProject.titlePt || nextProject.title}`}
                aria-label={lang === "en" ? `Next: ${nextProject.titleEn || nextProject.title}` : `Próximo: ${nextProject.titlePt || nextProject.title}`}
              >
                <span className="minimal-nav-tooltip">
                  {lang === "en" ? (nextProject.titleEn || nextProject.title) : (nextProject.titlePt || nextProject.title)}
                </span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// Markdown parser & renderer
function RenderRichMarkdown({ content }) {
  const { t } = useLanguage();
  if (!content) {
    return <p className="empty-content">{t("view.no_content")}</p>;
  }

  const lines = content.split("\n");
  const renderedElements = [];
  let inCode = false;
  let codeBuffer = [];
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      renderedElements.push(
        <div key={`tbl-${renderedElements.length}`} className="article-table-scroll">
          <table className="article-table">
            <tbody>
              {tableRows.map((row, rIdx) => {
                const cols = row
                  .split("|")
                  .map((c) => c.trim())
                  .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

                if (row.includes("---")) return null;

                return (
                  <tr key={rIdx}>
                    {cols.map((col, cIdx) =>
                      rIdx === 0 ? (
                        <th key={cIdx}>{formatInlineText(col)}</th>
                      ) : (
                        <td key={cIdx}>{formatInlineText(col)}</td>
                      )
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith("```")) {
      if (inTable) flushTable();
      if (inCode) {
        renderedElements.push(
          <div key={`code-${i}`} className="article-code-wrapper">
            <pre className="article-code">
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // Tables
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      inTable = true;
      tableRows.push(line.trim());
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Images: ![alt](url)
    const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      renderedElements.push(
        <div key={i} className="article-image-block">
          <img
            src={imgMatch[2]}
            alt={imgMatch[1] || "Screenshot"}
            className="article-md-img"
            loading="lazy"
          />
          {imgMatch[1] && <span className="article-img-caption">{imgMatch[1]}</span>}
        </div>
      );
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      renderedElements.push(
        <h2 key={i} className="article-h1">
          {formatInlineText(line.substring(2))}
        </h2>
      );
    } else if (line.startsWith("## ")) {
      renderedElements.push(
        <h3 key={i} className="article-h2">
          {formatInlineText(line.substring(3))}
        </h3>
      );
    } else if (line.startsWith("### ")) {
      renderedElements.push(
        <h4 key={i} className="article-h3">
          {formatInlineText(line.substring(4))}
        </h4>
      );
    } else if (line.startsWith("> ")) {
      renderedElements.push(
        <blockquote key={i} className="article-quote">
          {formatInlineText(line.substring(2))}
        </blockquote>
      );
    } else if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
      const isChecked = line.startsWith("- [x] ");
      renderedElements.push(
        <div key={i} className="article-checklist">
          <input type="checkbox" readOnly checked={isChecked} />
          <span>{formatInlineText(line.substring(6))}</span>
        </div>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      renderedElements.push(
        <li key={i} className="article-bullet">
          {formatInlineText(line.substring(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const textAfterNum = line.replace(/^\d+\.\s/, "");
      renderedElements.push(
        <p key={i} className="article-num-line">
          {formatInlineText(textAfterNum)}
        </p>
      );
    } else if (line.trim() === "---") {
      renderedElements.push(<hr key={i} className="article-hr" />);
    } else if (line.trim() === "") {
      renderedElements.push(<div key={i} className="article-gap"></div>);
    } else {
      renderedElements.push(
        <p key={i} className="article-paragraph">
          {formatInlineText(line)}
        </p>
      );
    }
  }

  if (inTable) flushTable();

  return <div className="article-flow">{renderedElements}</div>;
}

function formatInlineText(text) {
  if (!text) return "";

  const parts = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(subFormat(text.substring(lastIndex, match.index)));
    }
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(subFormat(text.substring(lastIndex)));
  }

  return parts.length > 0 ? parts : text;
}

function subFormat(str) {
  if (str.includes("`")) {
    const codeParts = str.split("`");
    return codeParts.map((sub, idx) =>
      idx % 2 === 1 ? <code key={idx}>{sub}</code> : sub
    );
  }
  return str;
}
