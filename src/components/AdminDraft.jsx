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

export const DEFAULT_AGENT_SYSTEM_PROMPT = `Você é o Assistente de Inteligência Artificial oficial do portfólio de Matheus de Castro.

## 🎯 SEU PAPEL E OBJETIVO
Seu objetivo é orientar visitantes, recrutadores, pesquisadores e parceiros técnicos, apresentando com clareza as qualificações, projetos, publicações e competências técnicas de Matheus de Castro nas áreas de:
- Machine Learning Engineering & Deep Learning (PyTorch, Visão Computacional, U-Net)
- Arquitetura de Backend & Engenharia de Software (Python, FastAPI, PostgreSQL, Docker)
- Automação de Fluxos de Trabalho Inteligentes (n8n, Linux Ubuntu Server, Bash)
- Formação Acadêmica: Bacharelado em Tecnologia da Informação (BTI) na UFRN e Técnico em TI pelo IFRN.

## 🛡️ DIRETRIZES RÍGIDAS DE COMPORTAMENTO
1. ESCOPO FECHADO: Responda APENAS sobre a trajetória acadêmica, profissional, projetos e artigos de Matheus de Castro.
2. RECUSA DE ESCOPO: Se o usuário pedir para gerar códigos aleatórios, receitas, redações ou tópicos não relacionados ao portfólio, responda cordialmente:
   "Como assistente oficial do portfólio de Matheus de Castro, meu escopo é limitado a dúvidas sobre seus projetos de IA, backend e currículo. Posso te apresentar projetos como o AgentMetrics ou a segmentação U-Net!"
3. TOM DE VOZ: Técnico, profissional, objetivo e preciso.
4. PROIBIDO ALUCINAR: Nunca invente experiências ou projetos que não constem no portfólio.
5. LINKS E REFERÊNCIAS: Sempre que falar de um projeto, direcione o usuário para o botão "Saber mais" ou para o GitHub oficial: https://github.com/Matheus-dCastro`;

export default function AdminDraft({ onBackToHome, onOpenProjectDetail, onNavigateToOrder }) {
  const [activeTab, setActiveTab] = useState("projects"); // 'projects' | 'articles' | 'thoughts' | 'agent'
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

  // AI Agent States
  const [agentPrompt, setAgentPrompt] = useState(() => {
    return localStorage.getItem("portfolio_agent_system_prompt") || DEFAULT_AGENT_SYSTEM_PROMPT;
  });
  const [agentModel] = useState("Qwen 2.5 Coder 32B-Instruct");
  const [testChatMessage, setTestChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Olá! Sou o assistente de IA do Matheus. Como posso ajudar com os projetos ou currículo?" }
  ]);

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
    if (tab === "agent") return;

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

  // Save Agent Prompt
  const handleSaveAgentPrompt = () => {
    localStorage.setItem("portfolio_agent_system_prompt", agentPrompt);
    showToast("🤖 System Prompt do Agente salvo com sucesso!");
  };

  const handleTestChatSubmit = (e) => {
    e.preventDefault();
    if (!testChatMessage.trim()) return;

    const userText = testChatMessage;
    setTestChatMessage("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);

    setTimeout(() => {
      let botResponse = "Com base no contexto do Matheus de Castro, ele desenvolveu o AgentMetrics (telemetria em FastAPI/Python) e pesquisas em U-Net para segmentação médica na UFRN. Você pode ver todos os detalhes na seção Works!";
      if (userText.toLowerCase().includes("experiência") || userText.toLowerCase().includes("currículo")) {
        botResponse = "Matheus possui sólida experiência em backend, atuando no Detran e na Cachina Soluções com automações em n8n, Linux Server, Python e banco de dados relacional.";
      }
      setChatMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    }, 600);
  };

  // Word Status calculations
  const wordCount = markdownContent.trim() ? markdownContent.trim().split(/\s+/).length : 0;
  const charCount = markdownContent.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 180));
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
      {/* Toast Notification (Bottom positioned, never overlaps navigation) */}
      {notification && (
        <div className="admin-toast">
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <nav className="admin-top-nav">
        <div className="nav-left">
          <div className="admin-badge">⚡ Painel 4dm1n</div>
          <div className="category-tabs">
            <button
              type="button"
              className={`cat-btn ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => handleTabChange("projects")}
            >
              💻 Projetos
            </button>
            <button
              type="button"
              className={`cat-btn ${activeTab === "articles" ? "active" : ""}`}
              onClick={() => handleTabChange("articles")}
            >
              📑 Artigos
            </button>
            <button
              type="button"
              className={`cat-btn ${activeTab === "thoughts" ? "active" : ""}`}
              onClick={() => handleTabChange("thoughts")}
            >
              💭 Pensamentos
            </button>
            <button
              type="button"
              className={`cat-btn agent-tab ${activeTab === "agent" ? "active" : ""}`}
              onClick={() => handleTabChange("agent")}
            >
              🤖 Assistente IA (Qwen)
            </button>
          </div>
        </div>

        <div className="nav-right">
          <button
            type="button"
            className="order-manager-btn"
            onClick={() => {
              if (onNavigateToOrder) onNavigateToOrder();
              else window.location.href = "/draft-order";
            }}
            title="Ir para o organizador visual em cards das 3 sessões"
          >
            🗂️ Organizar Vitrine por Tipo
          </button>
          {onOpenProjectDetail && activeTab !== "agent" && (
            <button
              type="button"
              className="preview-public-btn"
              onClick={() => onOpenProjectDetail(currentItemObject)}
              title="Abrir como o visitante vê na tela 'Saber Mais'"
            >
              👁️ Prévia Pública (Saber Mais)
            </button>
          )}
          <button type="button" className="back-site-btn" onClick={onBackToHome}>
            ← Voltar ao Portfólio
          </button>
        </div>
      </nav>

      {/* TAB 4: AGENT CONFIGURATION & SIMULATOR */}
      {activeTab === "agent" ? (
        <div className="agent-admin-dashboard">
          <div className="agent-dash-left">
            <div className="agent-card-section">
              <div className="agent-section-header">
                <h3>🤖 Arquitetura do Assistente IA</h3>
                <span className="badge-model">{agentModel}</span>
              </div>
              <p className="agent-section-desc">
                O assistente será instanciado de forma segura e serverless para que nenhuma chave de API
                fique exposta no navegador dos visitantes.
              </p>

              <div className="architecture-specs-grid">
                <div className="spec-card">
                  <span className="spec-icon">☁️</span>
                  <div>
                    <strong>Onde será hospedado</strong>
                    <p>Supabase Edge Functions (Deno Runtime com deploy na borda)</p>
                  </div>
                </div>
                <div className="spec-card">
                  <span className="spec-icon">🛡️</span>
                  <div>
                    <strong>Segurança de Chaves</strong>
                    <p>Secret <code>QWEN_API_KEY</code> isolado nos Secrets do Supabase</p>
                  </div>
                </div>
                <div className="spec-card">
                  <span className="spec-icon">📡</span>
                  <div>
                    <strong>Consumo de Informações</strong>
                    <p>Injeção direta do JSON de projetos, artigos e experiências no payload de contexto</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="agent-card-section prompt-editor-section">
              <div className="agent-section-header">
                <h3>📝 System Prompt do Agente (Rígido)</h3>
                <div className="prompt-actions">
                  <button
                    type="button"
                    className="btn-copy-prompt"
                    onClick={() => {
                      navigator.clipboard.writeText(agentPrompt);
                      showToast("Prompt copiado para a área de transferência!");
                    }}
                  >
                    Copiar Prompt
                  </button>
                  <button
                    type="button"
                    className="btn-reset-prompt"
                    onClick={() => {
                      if (window.confirm("Restaurar prompt padrão?")) {
                        setAgentPrompt(DEFAULT_AGENT_SYSTEM_PROMPT);
                      }
                    }}
                  >
                    Restaurar Padrão
                  </button>
                  <button
                    type="button"
                    className="btn-save-prompt"
                    onClick={handleSaveAgentPrompt}
                  >
                    💾 Salvar Prompt
                  </button>
                </div>
              </div>

              <textarea
                className="agent-prompt-textarea"
                rows="14"
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                placeholder="Insira o System Prompt que dita as regras de comportamento do modelo..."
              ></textarea>
            </div>
          </div>

          <div className="agent-dash-right">
            <div className="chat-simulator-container">
              <div className="chat-sim-header">
                <div className="bot-status-indicator">
                  <span className="status-dot"></span>
                  <strong>Simulador do Chatbot (Front-end Preview)</strong>
                </div>
                <span className="bot-pill">Qwen Ready</span>
              </div>

              <div className="chat-sim-messages">
                {chatMessages.map((msg, mIdx) => (
                  <div key={mIdx} className={`chat-bubble ${msg.sender}`}>
                    <span className="bubble-sender">{msg.sender === "user" ? "Visitante" : "Assistente Qwen"}</span>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>

              <form className="chat-sim-input-row" onSubmit={handleTestChatSubmit}>
                <input
                  type="text"
                  placeholder="Pergunte sobre os projetos do Matheus..."
                  value={testChatMessage}
                  onChange={(e) => setTestChatMessage(e.target.value)}
                />
                <button type="submit">Enviar ↗</button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* TABS 1, 2, 3: PROJECTS / ARTICLES / THOUGHTS EDITING */
        <div className="admin-body">
          {/* SIDEBAR: Item Explorer */}
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
                onClick={() => {
                  if (onNavigateToOrder) onNavigateToOrder();
                  else window.location.href = "/draft-order";
                }}
              >
                🗂️ Organizar Ordem dos Cards
              </button>
            </div>
          </aside>

          {/* EDITOR AREA */}
          <main className="admin-editor-workspace">
            {/* Metadata Header Form */}
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
                  <button
                    type="button"
                    className={`btn-toggle-meta ${isMetaOpen ? "active" : ""}`}
                    onClick={() => setIsMetaOpen(!isMetaOpen)}
                    title="Configurar Categoria, Tags, Links, Google Docs/PDF e Sinopse"
                  >
                    ⚙️ Propriedades {isMetaOpen ? "▲" : "▼"}
                  </button>

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

              {isMetaOpen && (
                <div className="collapsible-meta-drawer">
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

            {/* Word-like WYSIWYG Toolbar */}
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
                  title="Tachado"
                  onClick={() => applyToolbarFormat("strike")}
                >
                  <s>S</s>
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Código Inline"
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
                  title="Título 1"
                  onClick={() => applyToolbarFormat("h1")}
                >
                  H1
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Título 2"
                  onClick={() => applyToolbarFormat("h2")}
                >
                  H2
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Título 3"
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
                  title="Lista"
                  onClick={() => applyToolbarFormat("bullet-list")}
                >
                  • Lista
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Lista Numerada"
                  onClick={() => applyToolbarFormat("number-list")}
                >
                  1. Lista
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Tarefa"
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
                  title="Citação"
                  onClick={() => applyToolbarFormat("quote")}
                >
                  ❝ Citação
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Código"
                  onClick={() => applyToolbarFormat("code-block")}
                >
                  💻 Código
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Tabela"
                  onClick={() => applyToolbarFormat("table")}
                >
                  🗂️ Tabela
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Divisor"
                  onClick={() => applyToolbarFormat("divider")}
                >
                  ─ Divisor
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Link"
                  onClick={() => applyToolbarFormat("link")}
                >
                  🔗 Link
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Imagem"
                  onClick={() => applyToolbarFormat("image")}
                >
                  🖼️ Imagem
                </button>
              </div>

              <div className="toolbar-spacer"></div>

              <div className="toolbar-view-controls">
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === "editor" ? "active" : ""}`}
                  onClick={() => setViewMode("editor")}
                  title="Apenas Editor"
                >
                  ✍️ Editor
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === "split" ? "active" : ""}`}
                  onClick={() => setViewMode("split")}
                  title="Visualização Dividida"
                >
                  ⚖️ Dividido
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === "preview" ? "active" : ""}`}
                  onClick={() => setViewMode("preview")}
                  title="Prévia Formatada"
                >
                  📖 Prévia
                </button>
                <button
                  type="button"
                  className="shortcuts-help-btn"
                  onClick={() => setShowShortcutsModal(true)}
                  title="Atalhos"
                >
                  ⌨️ Atalhos
                </button>
              </div>
            </section>

            {/* Editor Canvas & Live Preview */}
            <div className={`editor-canvas-container mode-${viewMode}`}>
              {viewMode !== "preview" && (
                <div className="editor-input-pane">
                  <textarea
                    ref={textareaRef}
                    className="markdown-textarea"
                    value={markdownContent}
                    onChange={(e) => setMarkdownContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escreva em Markdown ou utilize os atalhos de teclado..."
                    spellCheck="false"
                  ></textarea>
                </div>
              )}

              {viewMode !== "editor" && (
                <div className="editor-preview-pane">
                  {contentType === "google-docs" && embedGoogleDocsUrl ? (
                    <div className="gdocs-live-frame-container">
                      <div className="live-frame-header">
                        <span>🌐 Pré-visualização do Google Docs:</span>
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
                        <span>📄 Pré-visualização do PDF:</span>
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="frame-external-link"
                        >
                          Download ↗
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

            {/* Status Bar */}
            <footer className="admin-status-bar">
              <div className="status-left">
                <span>Palavras: <strong>{wordCount}</strong></span>
                <span className="dot">•</span>
                <span>Caracteres: <strong>{charCount}</strong></span>
                <span className="dot">•</span>
                <span>Leitura: <strong>~{readTimeMin} min</strong></span>
              </div>

              <div className="status-right">
                <span className="status-source-tag">
                  Origem: <strong>{contentType === "google-docs" ? "Google Docs" : contentType === "pdf" ? "PDF" : "Markdown"}</strong>
                </span>
                <span className="dot">•</span>
                <span className="status-shortcut-hint"><code>Ctrl+S</code> para salvar</span>
              </div>
            </footer>
          </main>
        </div>
      )}

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
                <span>Negrito no texto selecionado</span>
              </div>
              <div className="shortcut-row">
                <code>Ctrl + I</code>
                <span>Itálico no texto selecionado</span>
              </div>
              <div className="shortcut-row">
                <code>Ctrl + K</code>
                <span>Inserir link rápido</span>
              </div>
              <div className="shortcut-row">
                <code>Ctrl + E</code>
                <span>Código inline</span>
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

// Helpers
function SimpleMarkdownRenderer({ content }) {
  if (!content) {
    return <p className="empty-preview-text">Comece a digitar no editor para ver a prévia...</p>;
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

    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      inTable = true;
      tableRows.push(line.trim());
      continue;
    } else if (inTable) {
      flushTable();
    }

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
