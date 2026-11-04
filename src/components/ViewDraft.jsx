import { useState } from "react";
import { getStoredProjects, getStoredArticles, convertGoogleDocsToEmbedUrl } from "../data/projectsData";
import { useLanguage } from "../context/useLanguage";
import LanguageSwitcher from "./LanguageSwitcher";
import "./ViewDraft.css";

function getInitialProject(propProject) {
  if (propProject) return propProject;
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("project") || urlParams.get("id");
  const allProjects = getStoredProjects();

  if (projectId) {
    const found = allProjects.find((p) => p.id === projectId);
    if (found) return found;
  }

  return allProjects.length > 0 ? allProjects[0] : null;
}

export default function ViewDraft({ project: propProject, onBackToHome, onSelectProject }) {
  const { t, lang } = useLanguage();
  const [internalProject, setInternalProject] = useState(() => getInitialProject(propProject));
  const [activeContentTab, setActiveContentTab] = useState("auto"); // 'auto' | 'readme' | 'gdocs' | 'pdf'

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

  const allProjects = getStoredProjects();
  const currentIndex = allProjects.findIndex((p) => p.id === project.id);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1]
      : null;

  const projectTitle = lang === "en" ? (project.titleEn || project.title) : (project.titlePt || project.title);
  const projectDesc = lang === "en"
    ? (project.shortDescriptionEn || project.shortDescription || project.aboutContextEn || project.aboutContext || t("view.default_context"))
    : (project.shortDescriptionPt || project.shortDescription || project.aboutContextPt || project.aboutContext || t("view.default_context"));
  const projectContent = lang === "en" ? (project.contentEn || project.content) : (project.contentPt || project.content);

  const hasGDocs = Boolean(project.googleDocsUrl);
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

  const embedGDocsUrl = convertGoogleDocsToEmbedUrl(project.googleDocsUrl);

  const wordCount = projectContent ? projectContent.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  const linkedArticle = project.relatedArticleId
    ? getStoredArticles().find((a) => a.id === project.relatedArticleId)
    : null;
  const linkedProject = project.relatedProjectId
    ? getStoredProjects().find((p) => p.id === project.relatedProjectId)
    : null;

  return (
    <div className="view-detail-page">
      {/* Top Header Bar - Integrated with system */}
      <nav className="view-top-header">
        <button className="back-to-projects-btn" onClick={onBackToHome}>
          <span className="arrow">←</span> {t("view.back_to_projects")}
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
          {hasGDocs && (
            <a
              href={project.googleDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn gdocs-action"
            >
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
              <span>{t("view.pdf_doc")}</span>
              <span className="external-arrow">↗</span>
            </a>
          )}
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Main Container */}
      <main className="view-main-article">
        {/* Article Header */}
        <div className="article-header">
          <div className="article-badges-row">
            <span
              className={`category-badge cat-${project.category
                ?.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")}`}
            >
              {project.category === "Profissional"
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

        {/* Next / Prev Project Navigation */}
        <section className="project-navigation-footer">
          <div className="nav-col prev-col">
            {prevProject && (
              <button
                type="button"
                className="nav-project-card"
                onClick={() => {
                  if (onSelectProject) onSelectProject(prevProject);
                  else setInternalProject(prevProject);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <span className="nav-direction">{t("view.prev_project")}</span>
                <h4 className="nav-title">
                  {lang === "en" ? (prevProject.titleEn || prevProject.title) : (prevProject.titlePt || prevProject.title)}
                </h4>
              </button>
            )}
          </div>

          <div className="nav-col next-col">
            {nextProject && (
              <button
                type="button"
                className="nav-project-card next"
                onClick={() => {
                  if (onSelectProject) onSelectProject(nextProject);
                  else setInternalProject(nextProject);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <span className="nav-direction">{t("view.next_project")}</span>
                <h4 className="nav-title">
                  {lang === "en" ? (nextProject.titleEn || nextProject.title) : (nextProject.titlePt || nextProject.title)}
                </h4>
              </button>
            )}
          </div>
        </section>

        {/* Call to action footer */}
        <footer className="article-end-cta">
          <h3>{t("view.cta_title")}</h3>
          <p>{t("view.cta_desc")}</p>
          <div className="cta-links">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta primary"
              >
                {t("view.cta_github")} <span>→</span>
              </a>
            )}
            <button className="btn-cta secondary" onClick={onBackToHome}>
              {t("view.cta_home")}
            </button>
          </div>
        </footer>
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
