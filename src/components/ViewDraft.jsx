import { useState } from "react";
import { getStoredProjects, convertGoogleDocsToEmbedUrl } from "../data/projectsData";
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
  const [internalProject, setInternalProject] = useState(() => getInitialProject(propProject));
  const [activeContentTab, setActiveContentTab] = useState("auto"); // 'auto' | 'readme' | 'gdocs' | 'pdf'

  const project = propProject || internalProject;

  if (!project) {
    return (
      <div className="view-loading-screen">
        <p>Carregando informações do projeto...</p>
        <button className="back-button" onClick={onBackToHome}>
          ← Voltar aos Projetos
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

  const hasGDocs = Boolean(project.googleDocsUrl);
  const hasPdf = Boolean(project.pdfUrl);
  const hasMarkdown = Boolean(project.content);

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

  const wordCount = project.content ? project.content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="view-detail-page">
      {/* Top Header Bar - Integrated with system */}
      <nav className="view-top-header">
        <button className="back-to-projects-btn" onClick={onBackToHome}>
          <span className="arrow">←</span> Voltar aos Projetos
        </button>

        <div className="header-actions-group">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn github-action"
            >
              <span>GitHub Repositório</span>
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
              <span>Live Demo</span>
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
              <span>Google Docs</span>
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
              <span>Documento PDF</span>
              <span className="external-arrow">↗</span>
            </a>
          )}
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
              {project.category || "Projeto"}
            </span>

            {project.tags?.map((tag, idx) => (
              <span key={idx} className="tech-badge">
                {tag}
              </span>
            ))}

            <span className="read-time-pill">
              ⏱ ~{readingTime} min de leitura
            </span>
          </div>

          <h1 className="article-main-title">{project.title}</h1>

          {/* AI Context / Synopsis Callout */}
          <div className="ai-context-callout">
            <div className="callout-header">
              <span className="callout-icon">✨</span>
              <span className="callout-label">Contexto & Resumo Executivo:</span>
            </div>
            <p className="callout-body">
              {project.aboutContext ||
                project.shortDescription ||
                "Visão técnica desenvolvida com foco em performance, arquitetura escalável e código limpo."}
            </p>
          </div>
        </div>

        {/* Content Type Selector (if multiple formats available) */}
        {(hasGDocs || hasPdf) && (
          <div className="content-format-switcher">
            <span className="switcher-title">Visualizar como:</span>
            <div className="switcher-buttons">
              {hasMarkdown && (
                <button
                  type="button"
                  className={`format-tab-btn ${currentFormat === "markdown" ? "active" : ""}`}
                  onClick={() => setActiveContentTab("markdown")}
                >
                  📝 Documentação & README
                </button>
              )}
              {hasGDocs && (
                <button
                  type="button"
                  className={`format-tab-btn ${currentFormat === "gdocs" ? "active" : ""}`}
                  onClick={() => setActiveContentTab("gdocs")}
                >
                  🌐 Google Docs Interativo
                </button>
              )}
              {hasPdf && (
                <button
                  type="button"
                  className={`format-tab-btn ${currentFormat === "pdf" ? "active" : ""}`}
                  onClick={() => setActiveContentTab("pdf")}
                >
                  📄 Documento PDF Integrado
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
                <span>📄 Documento sincronizado diretamente com o Google Docs</span>
                <a
                  href={project.googleDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-fullscreen-link"
                >
                  Abrir no Google Docs ↗
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
                <span>📄 Visualizador de Documento PDF</span>
                <a
                  href={project.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-fullscreen-link"
                >
                  Baixar / Abrir em Nova Aba ↗
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
              <RenderRichMarkdown content={project.content} />
            </div>
          )}
        </div>

        {/* Tech Stack Visual Pills Section */}
        {project.tags && project.tags.length > 0 && (
          <section className="tech-stack-section">
            <h3 className="section-subtitle">Tecnologias & Ferramentas Aplicadas</h3>
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
                <span className="nav-direction">← Projeto Anterior</span>
                <h4 className="nav-title">{prevProject.title}</h4>
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
                <span className="nav-direction">Próximo Projeto →</span>
                <h4 className="nav-title">{nextProject.title}</h4>
              </button>
            )}
          </div>
        </section>

        {/* Call to action footer */}
        <footer className="article-end-cta">
          <h3>Gostou deste projeto?</h3>
          <p>
            Explore o código fonte completo no GitHub ou entre em contato para colaborações,
            pesquisas em Machine Learning ou desenvolvimento de software.
          </p>
          <div className="cta-links">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta primary"
              >
                Ver Repositório no GitHub <span>→</span>
              </a>
            )}
            <button className="btn-cta secondary" onClick={onBackToHome}>
              Voltar ao Início
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Markdown parser & renderer
function RenderRichMarkdown({ content }) {
  if (!content) {
    return <p className="empty-content">Nenhuma documentação detalhada foi incluída para este projeto.</p>;
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
