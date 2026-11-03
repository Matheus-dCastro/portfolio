import { useState, useRef } from "react";
import {
  getStoredProjects,
  saveProjects,
  getStoredArticles,
  saveArticles,
  getStoredThoughts,
  saveThoughts,
  convertGoogleDocsToEmbedUrl
} from "../data/projectsData";
import { DOCUMENT_TEMPLATES } from "../data/templatesData";
import "./AdminDraft.css";

const generateUniqueId = () => `item-${Date.now()}`;

export default function AdminDraft({ onBackToHome, onOpenProjectDetail }) {
  const [activeTab, setActiveTab] = useState("projects"); // 'projects' | 'articles' | 'thoughts'
  const [items, setItems] = useState(() => getStoredProjects());

  const initialItem = items.length > 0 ? items[0] : null;

  const [selectedId, setSelectedId] = useState(() => initialItem?.id || null);
  const [viewMode, setViewMode] = useState("split"); // 'editor' | 'split' | 'preview'
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [notification, setNotification] = useState("");
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMetaOpen, setIsMetaOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState(() => initialItem?.title || "");
  const [category, setCategory] = useState(() => initialItem?.category || "Profissional");
  const [tags, setTags] = useState(() => (Array.isArray(initialItem?.tags) ? initialItem.tags.join(", ") : initialItem?.tags || ""));
  const [shortDescription, setShortDescription] = useState(() => initialItem?.shortDescription || "");
  const [aboutContext, setAboutContext] = useState(() => initialItem?.aboutContext || "");
  const [githubUrl, setGithubUrl] = useState(() => initialItem?.github || "");
  const [demoUrl, setDemoUrl] = useState(() => initialItem?.demo || "");
  const [contentType, setContentType] = useState(() => initialItem?.contentType || "markdown");
  const [googleDocsUrl, setGoogleDocsUrl] = useState(() => initialItem?.googleDocsUrl || "");
  const [pdfUrl, setPdfUrl] = useState(() => initialItem?.pdfUrl || "");
  const [markdownContent, setMarkdownContent] = useState(() => initialItem?.content || "");

  const textareaRef = useRef(null);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  const loadItemIntoForm = (item) => {
    setSelectedId(item.id);
    setTitle(item.title || "");
    setCategory(item.category || "Profissional");
    setTags(Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "");
    setShortDescription(item.shortDescription || "");
    setAboutContext(item.aboutContext || "");
    setGithubUrl(item.github || "");
    setDemoUrl(item.demo || "");
    setContentType(item.contentType || "markdown");
    setGoogleDocsUrl(item.googleDocsUrl || "");
    setPdfUrl(item.pdfUrl || "");
    setMarkdownContent(item.content || "");
  };

  const clearForm = () => {
    const newId = generateUniqueId();
    setSelectedId(newId);
    setTitle("Novo Documento");
    setCategory("Profissional");
    setTags("Python, IA, Backend");
    setShortDescription("");
    setAboutContext("");
    setGithubUrl("");
    setDemoUrl("");
    setContentType(activeTab === "articles" ? "google-docs" : "markdown");
    setGoogleDocsUrl("");
    setPdfUrl("");
    setMarkdownContent("# Novo Título\n\nComece a redigir o conteúdo aqui...");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    let nextList;
    if (tab === "projects") {
      nextList = getStoredProjects();
    } else if (tab === "articles") {
      nextList = getStoredArticles();
    } else {
      nextList = getStoredThoughts();
    }
    setItems(nextList);
    if (nextList.length > 0) {
      loadItemIntoForm(nextList[0]);
    } else {
      clearForm();
    }
  };

  // Apply template
  const handleApplyTemplate = (templateId) => {
    const tpl = DOCUMENT_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    if (
      markdownContent &&
      markdownContent.length > 50 &&
      !window.confirm(
        `Deseja carregar o modelo "${tpl.name}"? O conteúdo atual do editor será substituído.`
      )
    ) {
      return;
    }
    setTitle(tpl.name.replace(/^[^\s]+\s/, ""));
    setCategory(tpl.category);
    setTags(tpl.defaultTags);
    setShortDescription(tpl.defaultSummary);
    setAboutContext(tpl.defaultSummary);
    setContentType("markdown");
    setMarkdownContent(tpl.content);
    setSelectedTemplate("");
    showToast(`Modelo "${tpl.name}" carregado com sucesso!`);
  };

  // Obsidian / Word Shortcuts in Textarea
  const handleKeyDown = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);

    // Ctrl + S: Quick Save
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      handleSaveItem();
      return;
    }

    // Ctrl + B: Bold (**text**)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      insertWrapFormatting("**", "**", "texto em negrito");
      return;
    }

    // Ctrl + I: Italic (*text*)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      insertWrapFormatting("*", "*", "texto em itálico");
      return;
    }

    // Ctrl + K: Link ([text](url))
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const linkText = selection || "texto do link";
      const insertion = `[${linkText}](https://exemplo.com)`;
      replaceSelection(insertion, start + 1, start + 1 + linkText.length);
      return;
    }

    // Ctrl + Shift + X: Strikethrough (~~text~~)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "x") {
      e.preventDefault();
      insertWrapFormatting("~~", "~~", "texto riscado");
      return;
    }

    // Ctrl + Shift + C or Ctrl + E: Inline code (`code`)
    if (
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") ||
      ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e")
    ) {
      e.preventDefault();
      insertWrapFormatting("`", "`", "codigo");
      return;
    }

    // Tab / Shift + Tab: Indent / Unindent
    if (e.key === "Tab") {
      e.preventDefault();
      if (!e.shiftKey) {
        replaceSelection("  ", start + 2, start + 2);
      } else {
        if (start >= 2 && text.substring(start - 2, start) === "  ") {
          const newText = text.substring(0, start - 2) + text.substring(start);
          setMarkdownContent(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 2;
          }, 0);
        }
      }
      return;
    }

    // Smart Enter on lists (- , * , 1. , - [ ])
    if (e.key === "Enter") {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const currentLine = text.substring(lineStart, start);

      const checklistMatch = currentLine.match(/^(\s*)-\s\[([ xX])?\]\s(.*)$/);
      const bulletMatch = currentLine.match(/^(\s*)([-*])\s(.*)$/);
      const numberMatch = currentLine.match(/^(\s*)(\d+)\.\s(.*)$/);

      if (checklistMatch) {
        e.preventDefault();
        if (checklistMatch[3].trim() === "") {
          const newText = text.substring(0, lineStart) + text.substring(start);
          setMarkdownContent(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStart;
          }, 0);
        } else {
          const prefix = `\n${checklistMatch[1]}- [ ] `;
          replaceSelection(prefix, start + prefix.length, start + prefix.length);
        }
        return;
      }

      if (bulletMatch) {
        e.preventDefault();
        if (bulletMatch[3].trim() === "") {
          const newText = text.substring(0, lineStart) + text.substring(start);
          setMarkdownContent(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStart;
          }, 0);
        } else {
          const prefix = `\n${bulletMatch[1]}${bulletMatch[2]} `;
          replaceSelection(prefix, start + prefix.length, start + prefix.length);
        }
        return;
      }

      if (numberMatch) {
        e.preventDefault();
        if (numberMatch[3].trim() === "") {
          const newText = text.substring(0, lineStart) + text.substring(start);
          setMarkdownContent(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStart;
          }, 0);
        } else {
          const nextNum = parseInt(numberMatch[2], 10) + 1;
          const prefix = `\n${numberMatch[1]}${nextNum}. `;
          replaceSelection(prefix, start + prefix.length, start + prefix.length);
        }
        return;
      }
    }
  };

  const replaceSelection = (insertion, cursorStart, cursorEnd) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, start) + insertion + text.substring(end);
    setMarkdownContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = cursorStart;
      textarea.selectionEnd = cursorEnd;
    }, 0);
  };

  const insertWrapFormatting = (prefix, suffix, placeholder) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const insertion = prefix + (selected || placeholder) + suffix;
    const newText = text.substring(0, start) + insertion + text.substring(end);
    setMarkdownContent(newText);

    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = end + prefix.length;
      } else {
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = start + prefix.length + placeholder.length;
      }
    }, 0);
  };

  const applyToolbarFormat = (action) => {
    switch (action) {
      case "bold":
        insertWrapFormatting("**", "**", "texto negrito");
        break;
      case "italic":
        insertWrapFormatting("*", "*", "texto itálico");
        break;
      case "strike":
        insertWrapFormatting("~~", "~~", "texto riscado");
        break;
      case "inline-code":
        insertWrapFormatting("`", "`", "código");
        break;
      case "h1":
        insertLinePrefix("# ");
        break;
      case "h2":
        insertLinePrefix("## ");
        break;
      case "h3":
        insertLinePrefix("### ");
        break;
      case "bullet-list":
        insertLinePrefix("- ");
        break;
      case "number-list":
        insertLinePrefix("1. ");
        break;
      case "task-list":
        insertLinePrefix("- [ ] ");
        break;
      case "quote":
        insertLinePrefix("> ");
        break;
      case "code-block":
        insertWrapFormatting("```python\n", "\n```", "# Insira seu código aqui");
        break;
      case "table":
        replaceSelection(
          "\n| Cabeçalho 1 | Cabeçalho 2 | Cabeçalho 3 |\n| :--- | :--- | :--- |\n| Dado 1 | Dado 2 | Dado 3 |\n| Item A | Item B | Item C |\n",
          textareaRef.current.selectionStart + 1,
          textareaRef.current.selectionStart + 13
        );
        break;
      case "divider":
        replaceSelection("\n---\n", textareaRef.current.selectionStart + 5, textareaRef.current.selectionStart + 5);
        break;
      case "link":
        insertWrapFormatting("[", "](https://exemplo.com)", "texto do link");
        break;
      case "image":
        insertWrapFormatting("![", "](https://imagem.url/foto.png)", "legenda da imagem");
        break;
      default:
        break;
    }
  };

  const insertLinePrefix = (prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const text = textarea.value;
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;

    const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
    setMarkdownContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + prefix.length;
    }, 0);
  };

  // Save Item
  const handleSaveItem = () => {
    if (!title.trim()) {
      alert("Por favor, preencha o título do item.");
      return;
    }

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedItem = {
      id: selectedId || generateUniqueId(),
      title,
      category,
      tags: tagsArray,
      shortDescription,
      aboutContext: aboutContext || shortDescription,
      github: githubUrl,
      demo: demoUrl,
      contentType,
      googleDocsUrl,
      pdfUrl,
      content: markdownContent,
      updatedAt: new Date().toISOString().split("T")[0]
    };

    let newItems = [...items];
    const existingIndex = newItems.findIndex((it) => it.id === updatedItem.id);

    if (existingIndex >= 0) {
      newItems[existingIndex] = updatedItem;
    } else {
      newItems.unshift(updatedItem);
    }

    setItems(newItems);
    setSelectedId(updatedItem.id);

    if (activeTab === "projects") {
      saveProjects(newItems);
      showToast("✅ Projeto salvo localmente com sucesso!");
    } else if (activeTab === "articles") {
      saveArticles(newItems);
      showToast("✅ Artigo técnico salvo localmente com sucesso!");
    } else {
      saveThoughts(newItems);
      showToast("✅ Pensamento salvo localmente com sucesso!");
    }
  };

  // Delete item
  const handleDeleteItem = (id) => {
    if (!window.confirm("Deseja realmente remover este item?")) return;
    const newItems = items.filter((it) => it.id !== id);
    setItems(newItems);
    if (activeTab === "projects") saveProjects(newItems);
    else if (activeTab === "articles") saveArticles(newItems);
    else saveThoughts(newItems);

    if (newItems.length > 0) {
      loadItemIntoForm(newItems[0]);
    } else {
      clearForm();
    }
    showToast("Item removido com sucesso.");
  };

  // Calculations for Word status bar
  const wordCount = markdownContent.trim() ? markdownContent.trim().split(/\s+/).length : 0;
  const charCount = markdownContent.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 180));

  // Converted Google Docs embed link
  const embedGoogleDocsUrl = convertGoogleDocsToEmbedUrl(googleDocsUrl);

  const currentItemObject = {
    id: selectedId,
    title,
    category,
    tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    shortDescription,
    aboutContext,
    github: githubUrl,
    demo: demoUrl,
    contentType,
    googleDocsUrl,
    pdfUrl,
    content: markdownContent,
    updatedAt: "Recém Editado"
  };

  return (
    <div className="admin-editor-layout">
      {/* Toast Notification (Repositioned to bottom-right to never overlap top controls) */}
      {notification && (
        <div className="admin-toast">
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="admin-top-nav">
        <div className="nav-left">
          <div className="admin-badge">⚡ Painel 4dm1n (Draft)</div>
          <div className="category-tabs">
            <button
              className={`cat-btn ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => handleTabChange("projects")}
            >
              💻 Projetos
            </button>
            <button
              className={`cat-btn ${activeTab === "articles" ? "active" : ""}`}
              onClick={() => handleTabChange("articles")}
            >
              📑 Artigos
            </button>
            <button
              className={`cat-btn ${activeTab === "thoughts" ? "active" : ""}`}
              onClick={() => handleTabChange("thoughts")}
            >
              💭 Pensamentos
            </button>
          </div>
        </div>

        <div className="nav-right">
          <button
            className="order-manager-btn"
            onClick={() => (window.location.href = "/draft-order")}
            title="Ir para o organizador visual em cards"
          >
            ☰ Organizar Cards no Site
          </button>
          {onOpenProjectDetail && (
            <button
              className="preview-public-btn"
              onClick={() => onOpenProjectDetail(currentItemObject)}
              title="Abrir como o visitante vê na tela 'Saber Mais'"
            >
              👁️ Prévia Pública (Saber Mais)
            </button>
          )}
          <button className="back-site-btn" onClick={onBackToHome}>
            ← Voltar ao Portfólio
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="admin-body">
        {/* SIDEBAR: Item Explorer (with collapsible toggle) */}
        <aside className={`admin-sidebar-explorer ${!isSidebarOpen ? "collapsed" : ""}`}>
          <div className="explorer-header">
            <h3>{activeTab === "projects" ? "Meus Projetos" : activeTab === "articles" ? "Artigos & Papers" : "Pensamentos"}</h3>
            <div className="explorer-header-actions">
              <button className="btn-new-item" onClick={clearForm} title="Criar novo item do zero">
                + Novo
              </button>
              <button
                className="btn-collapse-sidebar"
                onClick={() => setIsSidebarOpen(false)}
                title="Recolher barra lateral"
              >
                ◀
              </button>
            </div>
          </div>

          <div className="explorer-items-list">
            {items.map((item, idx) => {
              const isSelected = item.id === selectedId;
              return (
                <div
                  key={item.id}
                  className={`explorer-item-card ${isSelected ? "selected" : ""}`}
                  onClick={() => loadItemIntoForm(item)}
                >
                  <div className="item-card-header">
                    <span className="card-order-num">#{idx + 1}</span>
                    <span className="card-category-pill">{item.category}</span>
                  </div>
                  <h4 className="item-card-title">{item.title}</h4>
                  <p className="item-card-desc">
                    {item.shortDescription || item.aboutContext || "Sem descrição"}
                  </p>
                  <div className="item-card-footer">
                    <span className="item-format-tag">
                      {item.contentType === "google-docs"
                        ? "🌐 Google Docs"
                        : item.contentType === "pdf"
                        ? "📄 PDF"
                        : "✍️ Markdown"}
                    </span>
                    <button
                      className="delete-item-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      title="Excluir item"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="explorer-footer">
            <button
              className="btn-reorder-link"
              onClick={() => (window.location.href = "/draft-order")}
            >
              🗂️ Reorganizar Ordem dos Cards
            </button>
          </div>
        </aside>

        {/* EDITOR AREA */}
        <main className="admin-editor-workspace">
          {/* Metadata & Source Form */}
          <section className="document-meta-header">
            <div className="meta-row-primary">
              {!isSidebarOpen && (
                <button
                  type="button"
                  className="btn-expand-sidebar"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Expandir lista de itens"
                >
                  ▶ Itens ({items.length})
                </button>
              )}

              <input
                type="text"
                className="document-title-input"
                placeholder="Título do Projeto ou Artigo..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="primary-actions-group">
                {/* Toggle button to collapse/expand properties drawer */}
                <button
                  type="button"
                  className={`btn-toggle-meta ${isMetaOpen ? "active" : ""}`}
                  onClick={() => setIsMetaOpen(!isMetaOpen)}
                  title="Configurar Categoria, Tags, Links, Google Docs/PDF e Sinopse"
                >
                  ⚙️ Propriedades {isMetaOpen ? "▲" : "▼"}
                </button>

                {/* Template Selector */}
                <div className="template-picker">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      if (e.target.value) handleApplyTemplate(e.target.value);
                    }}
                  >
                    <option value="">📋 Modelos...</option>
                    {DOCUMENT_TEMPLATES.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="btn-save-document" onClick={handleSaveItem}>
                  💾 Salvar
                </button>
              </div>
            </div>

            {/* Collapsible Meta Drawer (only rendered when isMetaOpen is true) */}
            {isMetaOpen && (
              <div className="collapsible-meta-drawer">
                {/* Content Source Selector: Markdown vs Google Docs vs PDF */}
                <div className="content-source-selector-bar">
                  <span className="source-label">Origem do Conteúdo:</span>
                  <div className="source-options">
                    <button
                      type="button"
                      className={`source-btn ${contentType === "markdown" ? "active" : ""}`}
                      onClick={() => setContentType("markdown")}
                    >
                      ✍️ Markdown & README
                    </button>
                    <button
                      type="button"
                      className={`source-btn ${contentType === "google-docs" ? "active" : ""}`}
                      onClick={() => setContentType("google-docs")}
                    >
                      🌐 Google Docs Integrado
                    </button>
                    <button
                      type="button"
                      className={`source-btn ${contentType === "pdf" ? "active" : ""}`}
                      onClick={() => setContentType("pdf")}
                    >
                      📄 Documento PDF
                    </button>
                  </div>

                  {contentType === "google-docs" && (
                    <span className="source-hint">
                      ✨ Artigos editados no Google Docs atualizam automaticamente no site!
                    </span>
                  )}
                </div>

                {/* Dynamic Inputs depending on Content Type */}
                {contentType === "google-docs" && (
                  <div className="external-source-card gdocs-source-card">
                    <div className="source-card-header">
                      <strong>🌐 Link do Google Docs</strong>
                      <span className="card-subtext">Cole o link público de compartilhamento ou publicação</span>
                    </div>
                    <div className="source-input-row">
                      <input
                        type="url"
                        placeholder="Ex: https://docs.google.com/document/d/.../edit ou /pub?embedded=true"
                        value={googleDocsUrl}
                        onChange={(e) => setGoogleDocsUrl(e.target.value)}
                      />
                      {googleDocsUrl && (
                        <a
                          href={googleDocsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-test-link"
                        >
                          Abrir no Google Docs ↗
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {contentType === "pdf" && (
                  <div className="external-source-card pdf-source-card">
                    <div className="source-card-header">
                      <strong>📄 Documento PDF (URL ou Arquivo)</strong>
                      <span className="card-subtext">Insira o link direto ou caminho do arquivo PDF</span>
                    </div>
                    <div className="source-input-row">
                      <input
                        type="text"
                        placeholder="Ex: /Matheus Vinicius Silva Freire de Castro.pdf ou URL externa"
                        value={pdfUrl}
                        onChange={(e) => setPdfUrl(e.target.value)}
                      />
                      {pdfUrl && (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-test-link"
                        >
                          Visualizar PDF ↗
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Secondary Metadata: Tags, Category, Links, Synopsis */}
                <div className="meta-secondary-grid">
                  <div className="meta-field">
                    <label>Categoria:</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Profissional">Profissional</option>
                      <option value="Acadêmico">Acadêmico</option>
                      <option value="Pessoal">Pessoal</option>
                    </select>
                  </div>

                  <div className="meta-field flex-2">
                    <label>Tags (separadas por vírgula):</label>
                    <input
                      type="text"
                      placeholder="Ex: FastAPI, Python, Deep Learning, PyTorch"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>

                  <div className="meta-field flex-2">
                    <label>GitHub Repositório:</label>
                    <input
                      type="text"
                      placeholder="https://github.com/Matheus-dCastro/..."
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </div>

                  <div className="meta-field">
                    <label>Live Demo (Opcional):</label>
                    <input
                      type="text"
                      placeholder="https://meusite.com"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="meta-synopsis-row">
                  <label>Sinopse / Contexto IA (Resumo destacado na página):</label>
                  <textarea
                    rows="2"
                    placeholder="Breve resumo objetivo que os visitantes e o agente Qwen usam para contextualizar o projeto..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}
          </section>

          {/* Word-like WYSIWYG Toolbar (with horizontal scroll on small screens to never overlap canvas) */}
          <section className="word-toolbar">
            <div className="toolbar-group">
              <button
                type="button"
                className="tool-btn"
                title="Negrito (Ctrl+B)"
                onClick={() => applyToolbarFormat("bold")}
              >
                <b>B</b>
              </button>
              <button
                type="button"
                className="tool-btn"
                title="Itálico (Ctrl+I)"
                onClick={() => applyToolbarFormat("italic")}
              >
                <i>I</i>
              </button>
              <button
                type="button"
                className="tool-btn"
                title="Tachado (Ctrl+Shift+X)"
                onClick={() => applyToolbarFormat("strike")}
              >
                <s>S</s>
              </button>
              <button
                type="button"
                className="tool-btn"
                title="Código Inline (Ctrl+E)"
                onClick={() => applyToolbarFormat("inline-code")}
              >
                <code>&lt;/&gt;</code>
              </button>
            </div>

            <span className="toolbar-divider"></span>

            <div className="toolbar-group">
              <button
                type="button"
                className="tool-btn"
                title="Título 1 (# )"
                onClick={() => applyToolbarFormat("h1")}
              >
                H1
              </button>
              <button
                type="button"
                className="tool-btn"
                title="Título 2 (## )"
                onClick={() => applyToolbarFormat("h2")}
              >
                H2
              </button>
              <button
                type="button"
                className="tool-btn"
                title="Título 3 (### )"
                onClick={() => applyToolbarFormat("h3")}
              >
                H3
              </button>
            </div>

            <span className="toolbar-divider"></span>

            <div className="toolbar-group">
              <button
                type="button"
                className="tool-btn"
                title="Lista com Marcadores (- )"
                onClick={() => applyToolbarFormat("bullet-list")}
              >
                • Lista
              </button>
              <button
                type="button"
                className="tool-btn"
                title="Lista Numerada (1. )"
                onClick={() => applyToolbarFormat("number-list")}
              >
                1. Lista
              </button>
              <button
                type="button"
                className="tool-btn"
                title="Checklist / Tarefas (- [ ] )"
                onClick={() => applyToolbarFormat("task-list")}
              >
                ☑ Tarefa
              </button>
            </div>

            <span className="toolbar-divider"></span>

            <div className="toolbar-group">
              <button
                type="button"
                className="tool-btn"
                title="Citação (> )"
                onClick={() => applyToolbarFormat("quote")}
              >
                ❝ Citação
              </button>
              <button
                type="button"
                className="tool-btn"
                title="Bloco de Código (```)"
                onClick={() => applyToolbarFormat("code-block")}
              >
                💻 Código
              </button>
              <button
                type="button"
                className="tool-btn"
                title="Tabela Markdown"
                onClick={() => applyToolbarFormat("table")}
              >
                🗂️ Tabela
              </button>
              <button
                type="button"
                className="tool-btn"
                title="Divisor de Seção (---)"
                onClick={() => applyToolbarFormat("divider")}
              >
                ─ Divisor
              </button>
              <button
                type="button"
                className="tool-btn"
                title="Inserir Link (Ctrl+K)"
                onClick={() => applyToolbarFormat("link")}
              >
                🔗 Link
              </button>
              <button
                type="button"
                className="tool-btn"
                title="Inserir Imagem"
                onClick={() => applyToolbarFormat("image")}
              >
                🖼️ Imagem
              </button>
            </div>

            <div className="toolbar-spacer"></div>

            {/* View Mode controls */}
            <div className="toolbar-view-controls">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === "editor" ? "active" : ""}`}
                onClick={() => setViewMode("editor")}
                title="Modo Apenas Editor"
              >
                ✍️ Editor
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === "split" ? "active" : ""}`}
                onClick={() => setViewMode("split")}
                title="Visualização Dividida (Obsidian Style)"
              >
                ⚖️ Dividido
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === "preview" ? "active" : ""}`}
                onClick={() => setViewMode("preview")}
                title="Modo Prévia Formatada"
              >
                📖 Prévia
              </button>
              <button
                type="button"
                className="shortcuts-help-btn"
                onClick={() => setShowShortcutsModal(true)}
                title="Ver atalhos de teclado do Obsidian"
              >
                ⌨️ Atalhos
              </button>
            </div>
          </section>

          {/* Editor Canvas & Live Preview Panes */}
          <div className={`editor-canvas-container mode-${viewMode}`}>
            {/* TEXTAREA EDITOR */}
            {viewMode !== "preview" && (
              <div className="editor-input-pane">
                <textarea
                  ref={textareaRef}
                  className="markdown-textarea"
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escreva em Markdown ou use os atalhos de teclado (Ctrl+B, Ctrl+I, Ctrl+K, Tab)..."
                  spellCheck="false"
                ></textarea>
              </div>
            )}

            {/* PREVIEW PANE: Rendered Markdown or Google Docs / PDF iframe */}
            {viewMode !== "editor" && (
              <div className="editor-preview-pane">
                {contentType === "google-docs" && embedGoogleDocsUrl ? (
                  <div className="gdocs-live-frame-container">
                    <div className="live-frame-header">
                      <span>🌐 Pré-visualização do Google Docs em Tempo Real:</span>
                      <a
                        href={googleDocsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="frame-external-link"
                      >
                        Abrir Externo ↗
                      </a>
                    </div>
                    <iframe
                      src={embedGoogleDocsUrl}
                      title="Google Docs Preview"
                      className="gdocs-embedded-iframe"
                      frameBorder="0"
                    ></iframe>
                  </div>
                ) : contentType === "pdf" && pdfUrl ? (
                  <div className="pdf-live-frame-container">
                    <div className="live-frame-header">
                      <span>📄 Pré-visualização do PDF Integrado:</span>
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="frame-external-link"
                      >
                        Download / Abrir PDF ↗
                      </a>
                    </div>
                    <iframe
                      src={pdfUrl}
                      title="PDF Preview"
                      className="pdf-embedded-iframe"
                      frameBorder="0"
                    ></iframe>
                  </div>
                ) : (
                  <div className="rendered-markdown-content">
                    <div className="preview-label-tag">Obsidian Live Preview</div>
                    <SimpleMarkdownRenderer content={markdownContent} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Bar (Word / Obsidian Style) */}
          <footer className="admin-status-bar">
            <div className="status-left">
              <span>Palavras: <strong>{wordCount}</strong></span>
              <span className="dot">•</span>
              <span>Caracteres: <strong>{charCount}</strong></span>
              <span className="dot">•</span>
              <span>Tempo estimado de leitura: <strong>~{readTimeMin} min</strong></span>
            </div>

            <div className="status-right">
              <span className="status-source-tag">
                Origem: <strong>{contentType === "google-docs" ? "Google Docs" : contentType === "pdf" ? "PDF" : "Markdown Local"}</strong>
              </span>
              <span className="dot">•</span>
              <span className="status-shortcut-hint">Pressione <code>Ctrl+S</code> para salvar rápido</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="shortcuts-modal-overlay" onClick={() => setShowShortcutsModal(false)}>
          <div className="shortcuts-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⌨️ Atalhos de Teclado (Obsidian & Word Style)</h3>
              <button className="btn-close-modal" onClick={() => setShowShortcutsModal(false)}>✕</button>
            </div>
            <div className="shortcuts-table">
              <div className="shortcut-row">
                <code>Ctrl + B</code>
                <span>Negrito no texto selecionado (<code>**texto**</code>)</span>
              </div>
              <div className="shortcut-row">
                <code>Ctrl + I</code>
                <span>Itálico no texto selecionado (<code>*texto*</code>)</span>
              </div>
              <div className="shortcut-row">
                <code>Ctrl + K</code>
                <span>Inserir link rápido (<code>[texto](url)</code>)</span>
              </div>
              <div className="shortcut-row">
                <code>Ctrl + E</code> ou <code>Ctrl + Shift + C</code>
                <span>Código inline (<code>`codigo`</code>)</span>
              </div>
              <div className="shortcut-row">
                <code>Ctrl + Shift + X</code>
                <span>Tachado / Riscado (<code>~~texto~~</code>)</span>
              </div>
              <div className="shortcut-row">
                <code>Tab</code> / <code>Shift + Tab</code>
                <span>Indentar / Desindentar linha</span>
              </div>
              <div className="shortcut-row">
                <code>Enter</code> em listas
                <span>Continua listas e checklists automaticamente</span>
              </div>
              <div className="shortcut-row">
                <code>Ctrl + S</code>
                <span>Salvar alterações imediatamente</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close-modal-bottom" onClick={() => setShowShortcutsModal(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple and safe Markdown renderer for Live Preview pane
function SimpleMarkdownRenderer({ content }) {
  if (!content) {
    return <p className="empty-preview-text">Comece a digitar no editor para ver a prévia em tempo real...</p>;
  }

  const lines = content.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = "";
  let inTable = false;
  let tableRows = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="preview-table-wrapper">
          <table className="preview-table">
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
                        <th key={cIdx}>{formatInlineMarkdown(col)}</th>
                      ) : (
                        <td key={cIdx}>{formatInlineMarkdown(col)}</td>
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
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className={`preview-code-block ${codeLang ? `language-${codeLang}` : ""}`}
          >
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.replace("```", "").trim();
      }
      continue;
    }

    if (inCodeBlock) {
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
      elements.push(<h1 key={i}>{formatInlineMarkdown(line.substring(2))}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i}>{formatInlineMarkdown(line.substring(3))}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i}>{formatInlineMarkdown(line.substring(4))}</h3>);
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i}>{formatInlineMarkdown(line.substring(2))}</blockquote>
      );
    } else if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
      const isChecked = line.startsWith("- [x] ");
      elements.push(
        <div key={i} className="preview-checklist-item">
          <input type="checkbox" readOnly checked={isChecked} />
          <span>{formatInlineMarkdown(line.substring(6))}</span>
        </div>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="preview-bullet-item">
          {formatInlineMarkdown(line.substring(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const textAfterNum = line.replace(/^\d+\.\s/, "");
      elements.push(
        <div key={i} className="preview-num-item">
          <span>{formatInlineMarkdown(textAfterNum)}</span>
        </div>
      );
    } else if (line.trim() === "---") {
      elements.push(<hr key={i} className="preview-divider" />);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="preview-spacer"></div>);
    } else {
      elements.push(<p key={i}>{formatInlineMarkdown(line)}</p>);
    }
  }

  if (inTable) flushTable();

  return <div className="markdown-render-flow">{elements}</div>;
}

function formatInlineMarkdown(text) {
  if (!text) return "";

  const parts = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(processItalicAndCode(text.substring(lastIndex, match.index)));
    }
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(processItalicAndCode(text.substring(lastIndex)));
  }

  return parts.length > 0 ? parts : text;
}

function processItalicAndCode(text) {
  if (text.includes("`")) {
    const codeParts = text.split("`");
    return codeParts.map((sub, idx) =>
      idx % 2 === 1 ? <code key={idx}>{sub}</code> : sub
    );
  }
  return text;
}
