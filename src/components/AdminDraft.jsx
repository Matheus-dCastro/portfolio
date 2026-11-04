import { useState, useRef, useEffect } from "react";
import {
  getStoredProjects,
  saveProjects,
  getStoredArticles,
  saveArticles,
  getStoredThoughts,
  saveThoughts,
  getStoredExperiences,
  saveExperiences,
  getStoredDrawings,
  getStoredCvConfig,
  saveCvConfig,
  DEFAULT_CV_CONFIG,
  convertGoogleDocsToEmbedUrl
} from "../data/projectsData";
import {
  fetchWorks,
  fetchArticles,
  fetchThoughts,
  fetchExperiences,
  fetchDrawings,
  fetchCvConfig,
  fetchAgentConfig,
  persistWork,
  removeWork,
  persistArticle,
  removeArticle,
  persistThought,
  removeThought,
  persistExperience,
  removeExperience,
  persistDrawing,
  removeDrawing,
  uploadDrawingImage,
  persistCvConfig,
  uploadCvPdf,
  persistAgentConfig,
  persistBatchOrder,
  getCurrentUser,
  logoutUser
} from "../lib/supabaseService";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { DOCUMENT_TEMPLATES } from "../data/templatesData";
import { sendChatMessage } from "../lib/llmService";
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
  const [showRelationModal, setShowRelationModal] = useState(false);
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
  const [relatedArticleId, setRelatedArticleId] = useState(() => initialItem?.relatedArticleId || "");
  const [relatedProjectId, setRelatedProjectId] = useState(() => initialItem?.relatedProjectId || "");

  // Experience states
  const [company, setCompany] = useState(() => initialItem?.company || "");
  const [timePeriod, setTimePeriod] = useState(() => initialItem?.time || "");
  const [bulletsText, setBulletsText] = useState(() => (Array.isArray(initialItem?.bullets) ? initialItem.bullets.join("\n") : ""));

  // AI Agent States
  const [agentPrompt, setAgentPrompt] = useState(() => {
    return localStorage.getItem("portfolio_agent_system_prompt") || DEFAULT_AGENT_SYSTEM_PROMPT;
  });
  const [agentModel] = useState("Qwen 2.5 Coder 32B-Instruct");
  const [testChatMessage, setTestChatMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Olá! Sou o assistente de IA do Matheus. Como posso ajudar com os projetos ou currículo?" }
  ]);

  // CV Dual-Mode States (Google Docs & PDF)
  const [cvGoogleDocsUrl, setCvGoogleDocsUrl] = useState(() => getStoredCvConfig().googleDocsUrl);
  const [cvPdfUrl, setCvPdfUrl] = useState(() => getStoredCvConfig().pdfUrl);
  const [cvUpdatedAt, setCvUpdatedAt] = useState(() => getStoredCvConfig().updatedAt || new Date().toISOString().split("T")[0]);
  const [isUploadingCvPdf, setIsUploadingCvPdf] = useState(false);
  const [isDraggingCvPdf, setIsDraggingCvPdf] = useState(false);
  const [cvUploadFeedback, setCvUploadFeedback] = useState(null);
  const cvFileInputRef = useRef(null);

  // Drawings states
  const [drawingTitle, setDrawingTitle] = useState("");
  const [drawingSrc, setDrawingSrc] = useState("");
  const [drawingDescription, setDrawingDescription] = useState("");
  const [drawingIsPublished, setDrawingIsPublished] = useState(true);
  const [isUploadingDrawing, setIsUploadingDrawing] = useState(false);
  const [isDraggingDrawing, setIsDraggingDrawing] = useState(false);
  const [drawingUploadFeedback, setDrawingUploadFeedback] = useState(null);
  const [drawingDisplayOrder, setDrawingDisplayOrder] = useState(0);
  const drawingFileInputRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u) setCurrentUser(u);
    });
  }, []);

  useEffect(() => {
    if (activeTab === "projects") {
      fetchWorks(true).then((data) => {
        if (Array.isArray(data)) setItems(data);
      });
    } else if (activeTab === "articles") {
      fetchArticles(true).then((data) => {
        if (Array.isArray(data)) setItems(data);
      });
    } else if (activeTab === "thoughts") {
      fetchThoughts(true).then((data) => {
        if (Array.isArray(data)) setItems(data);
      });
    } else if (activeTab === "experiences") {
      fetchExperiences(true).then((data) => {
        if (Array.isArray(data)) setItems(data);
      });
    } else if (activeTab === "drawings") {
      fetchDrawings(true).then((data) => {
        if (Array.isArray(data)) setItems(data);
      });
    } else if (activeTab === "cv") {
      fetchCvConfig().then((cfg) => {
        if (cfg) {
          setCvGoogleDocsUrl(cfg.googleDocsUrl || "");
          setCvPdfUrl(cfg.pdfUrl || "");
          setCvUpdatedAt(cfg.updatedAt || "");
        }
      });
    } else if (activeTab === "agent") {
      fetchAgentConfig().then((cfg) => {
        if (cfg?.systemPrompt) setAgentPrompt(cfg.systemPrompt);
      });
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    showToast("Você encerrou a sessão de administrador.");
  };

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
    setRelatedArticleId(item.relatedArticleId || "");
    setRelatedProjectId(item.relatedProjectId || "");
    setCompany(item.company || "");
    setTimePeriod(item.time || "");
    setBulletsText(Array.isArray(item.bullets) ? item.bullets.join("\n") : item.bullets || "");
  };

  const clearForm = () => {
    setSelectedId(null);
    setTitle("");
    setCategory(activeTab === "articles" ? "Acadêmico" : "Profissional");
    setTags("");
    setShortDescription("");
    setAboutContext("");
    setGithubUrl("");
    setDemoUrl("");
    setContentType(activeTab === "articles" ? "google-docs" : "markdown");
    setGoogleDocsUrl("");
    setPdfUrl("");
    setMarkdownContent("");
    setRelatedArticleId("");
    setRelatedProjectId("");
    setCompany("");
    setTimePeriod("");
    setBulletsText("");
  };

  const loadDrawingIntoForm = (item) => {
    setSelectedId(item.id);
    setDrawingTitle(item.title || "");
    setDrawingSrc(item.src || "");
    setDrawingDescription(item.description || "");
    setDrawingIsPublished(item.isPublished !== false);
    setDrawingDisplayOrder(item.displayOrder ?? 0);
    setDrawingUploadFeedback(null);
  };

  const clearDrawingForm = () => {
    setSelectedId(null);
    setDrawingTitle("");
    setDrawingSrc("");
    setDrawingDescription("");
    setDrawingIsPublished(true);
    setDrawingDisplayOrder(items.length);
    setDrawingUploadFeedback(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "agent" || tab === "cv") return;

    let nextList = [];
    if (tab === "projects") {
      nextList = getStoredProjects();
    } else if (tab === "articles") {
      nextList = getStoredArticles();
    } else if (tab === "thoughts") {
      nextList = getStoredThoughts();
    } else if (tab === "experiences") {
      nextList = getStoredExperiences();
    } else if (tab === "drawings") {
      nextList = getStoredDrawings();
    }
    setItems(nextList);
    if (tab === "drawings") {
      if (nextList.length > 0) {
        loadDrawingIntoForm(nextList[0]);
      } else {
        clearDrawingForm();
      }
    } else {
      if (nextList.length > 0) {
        loadItemIntoForm(nextList[0]);
      } else {
        clearForm();
      }
    }
  };

  const handleSaveCv = async (e) => {
    if (e) e.preventDefault();
    const cleanDocs = cvGoogleDocsUrl.trim();
    const cleanPdf = cvPdfUrl.trim();
    const newConfig = {
      googleDocsUrl: cleanDocs,
      pdfUrl: cleanPdf,
      updatedAt: cvUpdatedAt || new Date().toISOString().split("T")[0]
    };
    const res = await persistCvConfig(newConfig);
    showToast(
      res.cloud
        ? "☁️ Configurações do Currículo sincronizadas no Supabase!"
        : "💾 Configurações do Currículo salvas localmente (offline)!"
    );
  };

  const handleResetCv = () => {
    if (window.confirm("Deseja restaurar as configurações padrão do currículo?")) {
      saveCvConfig(DEFAULT_CV_CONFIG);
      setCvGoogleDocsUrl(DEFAULT_CV_CONFIG.googleDocsUrl);
      setCvPdfUrl(DEFAULT_CV_CONFIG.pdfUrl);
      setCvUpdatedAt(DEFAULT_CV_CONFIG.updatedAt);
      showToast("Configurações do currículo restauradas para o padrão.");
    }
  };

  const handleProcessCvFile = async (file) => {
    if (!file) return;
    const isPdf = file.name?.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
    if (!isPdf) {
      setCvUploadFeedback({
        type: "error",
        message: "Apenas arquivos em formato PDF (.pdf) são permitidos para o Currículo."
      });
      return;
    }

    try {
      setIsUploadingCvPdf(true);
      setCvUploadFeedback(null);
      const res = await uploadCvPdf(file);
      setCvPdfUrl(res.publicUrl);
      if (res.config?.updatedAt) {
        setCvUpdatedAt(res.config.updatedAt);
      }
      setCvUploadFeedback({
        type: "success",
        message: `Novo PDF "${file.name}" enviado com sucesso ao Supabase Storage e vinculado!`
      });
      showToast("☁️ Novo PDF do CV enviado com sucesso para o Supabase Storage!");
    } catch (err) {
      console.error("Falha ao subir CV PDF:", err);
      setCvUploadFeedback({
        type: "error",
        message: err.message || "Erro ao enviar o PDF para o Supabase Storage."
      });
    } finally {
      setIsUploadingCvPdf(false);
    }
  };

  const handleCvDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCvPdf(true);
  };

  const handleCvDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCvPdf(false);
  };

  const handleCvDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCvPdf(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleProcessCvFile(files[0]);
    }
  };

  const handleCvFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessCvFile(files[0]);
    }
  };

  // Drawing Handlers
  const handleProcessDrawingFile = async (file) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/") || /\.(webp|jpg|jpeg|png|gif|svg)$/i.test(file.name);
    if (!isImage) {
      setDrawingUploadFeedback({
        type: "error",
        message: "Apenas arquivos de imagem (WebP, PNG, JPG, GIF, SVG) são permitidos."
      });
      return;
    }

    try {
      setIsUploadingDrawing(true);
      setDrawingUploadFeedback(null);
      const res = await uploadDrawingImage(file);
      setDrawingSrc(res.publicUrl);
      if (!drawingTitle) {
        const fallbackTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setDrawingTitle(fallbackTitle);
      }
      setDrawingUploadFeedback({
        type: "success",
        message: `Imagem "${file.name}" carregada com sucesso!`
      });
      showToast(res.cloud ? "☁️ Imagem enviada ao Supabase Storage!" : "💾 Imagem carregada (offline)!");
    } catch (err) {
      console.error("Falha ao subir imagem do desenho:", err);
      setDrawingUploadFeedback({
        type: "error",
        message: err.message || "Erro ao processar imagem."
      });
    } finally {
      setIsUploadingDrawing(false);
    }
  };

  const handleDrawingDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDrawing(true);
  };

  const handleDrawingDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDrawing(false);
  };

  const handleDrawingDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDrawing(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleProcessDrawingFile(files[0]);
    }
  };

  const handleDrawingFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessDrawingFile(files[0]);
    }
  };

  const handleMoveDrawing = async (currentIndex, delta) => {
    const targetIndex = currentIndex + delta;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const [moved] = newItems.splice(currentIndex, 1);
    newItems.splice(targetIndex, 0, moved);

    const reordered = newItems.map((it, idx) => ({
      ...it,
      displayOrder: idx
    }));

    setItems(reordered);
    const res = await persistBatchOrder("drawings", reordered);
    showToast(
      res.cloud
        ? "☁️ Ordem dos desenhos atualizada no Supabase!"
        : "💾 Ordem dos desenhos atualizada localmente!"
    );
  };

  const handleSaveDrawing = async (e) => {
    if (e) e.preventDefault();
    if (!drawingTitle.trim()) {
      alert("Por favor, preencha o título do desenho.");
      return;
    }
    if (!drawingSrc.trim()) {
      alert("Por favor, selecione uma imagem ou informe a URL da arte.");
      return;
    }

    const targetOrder = Math.max(0, drawingDisplayOrder);

    const drawingItem = {
      id: selectedId || generateUniqueId(),
      title: drawingTitle.trim(),
      src: drawingSrc.trim(),
      description: drawingDescription.trim(),
      displayOrder: targetOrder,
      isPublished: drawingIsPublished !== false,
      updatedAt: new Date().toISOString().split("T")[0]
    };

    let newItems = [...items];
    const existingIndex = newItems.findIndex((it) => it.id === drawingItem.id);
    if (existingIndex >= 0) {
      newItems.splice(existingIndex, 1);
    }
    const insertIdx = Math.min(newItems.length, targetOrder);
    newItems.splice(insertIdx, 0, drawingItem);

    // Normalize display orders sequentially
    const normalized = newItems.map((it, idx) => ({
      ...it,
      displayOrder: idx
    }));

    setItems(normalized);
    setSelectedId(drawingItem.id);

    const res = await persistDrawing(drawingItem);
    await persistBatchOrder("drawings", normalized);
    showToast(
      res.cloud
        ? "☁️ Desenho salvo e ordem sincronizada no Supabase!"
        : "💾 Desenho salvo localmente (offline)!"
    );
  };

  const handleDeleteDrawing = async (id) => {
    if (!window.confirm("Deseja realmente remover esta arte da galeria?")) return;
    const newItems = items.filter((d) => d.id !== id);
    setItems(newItems);
    await removeDrawing(id);

    if (newItems.length > 0) {
      loadDrawingIntoForm(newItems[0]);
    } else {
      clearDrawingForm();
    }
    showToast("Arte removida com sucesso.");
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
  const handleDeleteItem = async (id) => {
    if (!window.confirm("Deseja realmente remover este item?")) return;
    const newItems = items.filter((it) => it.id !== id);
    setItems(newItems);
    if (activeTab === "projects") {
      saveProjects(newItems);
      await removeWork(id);
    } else if (activeTab === "articles") {
      saveArticles(newItems);
      await removeArticle(id);
    } else if (activeTab === "experiences") {
      saveExperiences(newItems);
      await removeExperience(id);
    } else {
      saveThoughts(newItems);
      await removeThought(id);
    }

    if (newItems.length > 0) {
      loadItemIntoForm(newItems[0]);
    } else {
      clearForm();
    }
    showToast("Item removido com sucesso.");
  };

  // Save Item
  const handleSaveItem = async () => {
    if (!title.trim()) {
      alert(activeTab === "experiences" ? "Por favor, preencha o cargo ou formação." : "Por favor, preencha o título do item.");
      return;
    }

    if (activeTab === "experiences") {
      const expItem = {
        id: selectedId || generateUniqueId(),
        title,
        company: company || "Empresa / Instituição",
        time: timePeriod || "Período",
        bullets: bulletsText.split("\n").map((b) => b.trim()).filter(Boolean),
        displayOrder: items.findIndex((it) => it.id === selectedId) >= 0 ? items.find((it) => it.id === selectedId).displayOrder : items.length,
        isPublished: true,
        updatedAt: new Date().toISOString().split("T")[0]
      };

      let newItems = [...items];
      const existingIndex = newItems.findIndex((it) => it.id === expItem.id);
      if (existingIndex >= 0) newItems[existingIndex] = expItem;
      else newItems.unshift(expItem);

      setItems(newItems);
      setSelectedId(expItem.id);

      const res = await persistExperience(expItem);
      showToast(
        res.cloud
          ? "☁️ Experiência profissional salva no Supabase!"
          : "💾 Experiência salva localmente (offline)!"
      );
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
      relatedArticleId: activeTab === "projects" ? relatedArticleId : undefined,
      relatedProjectId: activeTab === "articles" ? relatedProjectId : undefined,
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
      const res = await persistWork(updatedItem);
      showToast(
        res.cloud
          ? "☁️ Projeto salvo e sincronizado no Supabase!"
          : "💾 Projeto salvo localmente (offline)!"
      );
    } else if (activeTab === "articles") {
      const res = await persistArticle(updatedItem);
      showToast(
        res.cloud
          ? "☁️ Artigo técnico salvo no Supabase!"
          : "💾 Artigo técnico salvo localmente (offline)!"
      );
    } else {
      const res = await persistThought(updatedItem);
      showToast(
        res.cloud
          ? "☁️ Pensamento salvo no Supabase!"
          : "💾 Pensamento salvo localmente (offline)!"
      );
    }
  };

  // Save Agent Prompt
  const handleSaveAgentPrompt = async () => {
    const res = await persistAgentConfig(agentPrompt);
    showToast(
      res.cloud
        ? "🤖 System Prompt salvo e sincronizado no Supabase!"
        : "💾 Prompt do Agente salvo localmente!"
    );
  };

  const handleTestChatSubmit = async (e) => {
    e.preventDefault();
    if (!testChatMessage.trim() || isChatLoading) return;

    const userText = testChatMessage;
    setTestChatMessage("");
    const newHistory = [...chatMessages, { sender: "user", text: userText }];
    setChatMessages(newHistory);
    setIsChatLoading(true);

    try {
      const res = await sendChatMessage(newHistory, agentPrompt);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: res.text,
          model: res.model
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Erro ao obter resposta da IA: ${err.message}`
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
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
    relatedArticleId: activeTab === "projects" ? relatedArticleId : undefined,
    relatedProjectId: activeTab === "articles" ? relatedProjectId : undefined,
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
          <div className="admin-badge" title="Status de persistência do banco">
            {isSupabaseConfigured ? "🟢 Supabase Cloud" : "🟡 Modo Offline"}
          </div>
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#8b949e", background: "#161b22", padding: "4px 10px", borderRadius: "6px", border: "1px solid #30363d" }}>
              <span>👤 {currentUser.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: "#21262d",
                  border: "1px solid #484f58",
                  color: "#f85149",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  cursor: "pointer",
                  fontSize: "11px"
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            <a
              href="/l0g1n"
              style={{
                fontSize: "12px",
                color: "#58a6ff",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "#161b22",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "1px solid #30363d"
              }}
            >
              Login Supabase
            </a>
          )}
          <div className="category-tabs">
            <button
              type="button"
              className={`cat-btn ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => handleTabChange("projects")}
            >
              Projetos
            </button>
            <button
              type="button"
              className={`cat-btn ${activeTab === "articles" ? "active" : ""}`}
              onClick={() => handleTabChange("articles")}
            >
              Artigos
            </button>
            <button
              type="button"
              className={`cat-btn ${activeTab === "thoughts" ? "active" : ""}`}
              onClick={() => handleTabChange("thoughts")}
            >
              Pensamentos
            </button>
            <button
              type="button"
              className={`cat-btn ${activeTab === "experiences" ? "active" : ""}`}
              onClick={() => handleTabChange("experiences")}
            >
              Experiências
            </button>
            <button
              type="button"
              className={`cat-btn ${activeTab === "cv" ? "active" : ""}`}
              onClick={() => handleTabChange("cv")}
            >
              Currículo (CV)
            </button>
            <button
              type="button"
              className={`cat-btn ${activeTab === "drawings" ? "active" : ""}`}
              onClick={() => handleTabChange("drawings")}
            >
            Desenhos
            </button>
            <button
              type="button"
              className={`cat-btn agent-tab ${activeTab === "agent" ? "active" : ""}`}
              onClick={() => handleTabChange("agent")}
            >
              Assistente IA (Alomyr)
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
            Organizar Vitrine por Tipo
          </button>
          {onOpenProjectDetail && activeTab !== "agent" && activeTab !== "cv" && activeTab !== "drawings" && (
            <button
              type="button"
              className="preview-public-btn"
              onClick={() => onOpenProjectDetail(currentItemObject)}
              title="Abrir como o visitante vê na tela 'Saber Mais'"
            >
              Prévia Pública (Saber Mais)
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
                <h3>Arquitetura do Assistente IA</h3>
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
                  <strong>Simulador do Chatbot (Alomyr • Groq Real)</strong>
                </div>
                <span className="bot-pill" style={{ background: "rgba(52, 211, 153, 0.15)", color: "#34d399", borderColor: "rgba(52, 211, 153, 0.3)" }}>
                  Alomyr Online
                </span>
              </div>

              <div className="chat-sim-messages">
                {chatMessages.map((msg, mIdx) => (
                  <div key={mIdx} className={`chat-bubble ${msg.sender}`}>
                    <span className="bubble-sender">{msg.sender === "user" ? "Visitante" : "Alomyr"}</span>
                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="chat-bubble bot" style={{ opacity: 0.85, fontStyle: "italic", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="typing-dot"></span>
                    <span>Alomyr processando via Groq API...</span>
                  </div>
                )}
              </div>

              <form className="chat-sim-input-row" onSubmit={handleTestChatSubmit}>
                <input
                  type="text"
                  placeholder={isChatLoading ? "Aguardando resposta do modelo..." : "Pergunte sobre os projetos do Matheus..."}
                  value={testChatMessage}
                  onChange={(e) => setTestChatMessage(e.target.value)}
                  disabled={isChatLoading}
                />
                <button type="submit" disabled={isChatLoading || !testChatMessage.trim()}>
                  {isChatLoading ? "Enviando..." : "Enviar ↗"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : activeTab === "cv" ? (
        <div className="cv-admin-dashboard">
          <div className="cv-dash-left">
            <div className="cv-card-section">
              <div className="cv-section-header">
                <div>
                  <h2>📄 Gestão do Currículo (Dual-Mode)</h2>
                  <p className="cv-section-subtitle">
                    Configure os links do seu currículo. O visitante poderá escolher entre a versão interativa no <strong>Google Docs</strong> ou baixar o <strong>PDF Oficial</strong> diretamente pelo modal do Hero.
                  </p>
                </div>
                <div className="cv-status-badge">
                  <span className="cv-status-dot"></span> Ativo no Portfólio
                </div>
              </div>

              <form onSubmit={handleSaveCv} className="cv-form">
                <div className="cv-form-group">
                  <label htmlFor="cv-docs-url">
                    <span className="label-icon">🌐</span>
                    <strong>Versão Web Interativa (Google Docs)</strong>
                    <span className="cv-input-badge docs-badge">Sempre Atualizado</span>
                  </label>
                  <p className="cv-field-hint">
                    Link público do seu currículo no Google Docs. Permite que recrutadores leiam imediatamente no navegador sem precisar baixar nada.
                  </p>
                  <div className="cv-input-with-action">
                    <input
                      id="cv-docs-url"
                      type="url"
                      className="cv-input"
                      placeholder="https://docs.google.com/document/d/.../edit?usp=sharing"
                      value={cvGoogleDocsUrl}
                      onChange={(e) => setCvGoogleDocsUrl(e.target.value)}
                      required
                    />
                    {cvGoogleDocsUrl && (
                      <a
                        href={cvGoogleDocsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cv-action-test-btn docs-btn"
                        title="Abrir no Google Docs em nova aba"
                      >
                        Abrir Docs ↗
                      </a>
                    )}
                  </div>
                  <small className="cv-hint-note">
                    💡 <em>Como obter:</em> No Google Docs &gt; Compartilhar &gt; Acesso Geral: &quot;Qualquer pessoa com o link&quot; (Leitor) &gt; Copiar link.
                  </small>
                </div>

                <div className="cv-form-group">
                  <label htmlFor="cv-pdf-url">
                    <span className="label-icon">📄</span>
                    <strong>Documento Oficial (Arquivo PDF)</strong>
                    <span className="cv-input-badge pdf-badge">Upload Direto / Supabase</span>
                  </label>
                  <p className="cv-field-hint">
                    Arraste o novo PDF do seu currículo para substituir o antigo. O arquivo será enviado direto ao Supabase Storage e vinculado instantaneamente.
                  </p>

                  {/* Drag and Drop Zone Exclusiva para PDF */}
                  <div
                    className={`cv-pdf-dropzone ${isDraggingCvPdf ? "dragging" : ""} ${isUploadingCvPdf ? "uploading" : ""}`}
                    onDragOver={handleCvDragOver}
                    onDragLeave={handleCvDragLeave}
                    onDrop={handleCvDrop}
                    onClick={() => !isUploadingCvPdf && cvFileInputRef.current?.click()}
                    title="Clique ou arraste um PDF aqui"
                  >
                    <input
                      ref={cvFileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      style={{ display: "none" }}
                      onChange={handleCvFileInputChange}
                    />
                    <div className="cv-dropzone-inner">
                      {isUploadingCvPdf ? (
                        <div className="cv-dropzone-status">
                          <div className="cv-dropzone-spinner"></div>
                          <span>Enviando novo PDF para o Supabase Storage...</span>
                        </div>
                      ) : (
                        <>
                          <div className="cv-dropzone-icon">📥</div>
                          <div className="cv-dropzone-text">
                            <strong>Arraste seu novo PDF aqui</strong> ou <u>clique para navegar</u>
                          </div>
                          <span className="cv-dropzone-badge">Somente arquivos .pdf • Substituição direta na nuvem</span>
                        </>
                      )}
                    </div>
                  </div>

                  {cvUploadFeedback && (
                    <div className={`cv-upload-feedback-box ${cvUploadFeedback.type}`}>
                      <span>{cvUploadFeedback.type === "success" ? "✅" : "⚠️"} {cvUploadFeedback.message}</span>
                    </div>
                  )}

                  <div className="cv-input-with-action" style={{ marginTop: "12px" }}>
                    <input
                      id="cv-pdf-url"
                      type="text"
                      className="cv-input"
                      placeholder="URL do PDF no Supabase Storage ou caminho local"
                      value={cvPdfUrl}
                      onChange={(e) => setCvPdfUrl(e.target.value)}
                      required
                    />
                    {cvPdfUrl && (
                      <a
                        href={cvPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cv-action-test-btn pdf-btn"
                        title="Testar visualização ou download do PDF"
                      >
                        Abrir PDF ↗
                      </a>
                    )}
                  </div>
                  <small className="cv-hint-note">
                    💡 <em>Link ativo:</em> Qualquer novo upload substitui o link anterior automaticamente no banco de dados e no portfólio.
                  </small>
                </div>

                <div className="cv-form-group">
                  <label htmlFor="cv-updated-at">
                    <span className="label-icon">📅</span>
                    <strong>Data da Última Atualização</strong>
                  </label>
                  <input
                    id="cv-updated-at"
                    type="date"
                    className="cv-input cv-date-input"
                    value={cvUpdatedAt}
                    onChange={(e) => setCvUpdatedAt(e.target.value)}
                  />
                  <small className="cv-hint-note">
                    Exibida no rodapé do modal para garantir ao recrutador que o currículo está atualizado.
                  </small>
                </div>

                <div className="cv-form-actions">
                  <button type="submit" className="btn-save-cv-primary">
                    💾 Salvar Configurações do CV
                  </button>
                  <button type="button" onClick={handleResetCv} className="btn-reset-cv-secondary">
                    ↺ Restaurar Padrões
                  </button>
                </div>
              </form>
            </div>

            <div className="cv-info-card">
              <h3>ℹ️ Fluxo de Experiência do Visitante</h3>
              <ul className="cv-flow-list">
                <li>
                  <span className="step-num">1</span>
                  <span>O visitante clica no botão <strong>&quot;📄 Download CV / Docs&quot;</strong> na tela inicial.</span>
                </li>
                <li>
                  <span className="step-num">2</span>
                  <span>Surge o popup moderno perguntando: <em>&quot;Versão Web Interativa (Google Docs)&quot;</em> ou <em>&quot;Documento Oficial PDF&quot;</em>.</span>
                </li>
                <li>
                  <span className="step-num">3</span>
                  <span>Ao clicar em <strong>Google Docs</strong>, visualiza na hora sem download prévio.</span>
                </li>
                <li>
                  <span className="step-num">4</span>
                  <span>Ao clicar em <strong>PDF</strong>, faz download direto ou abre para impressão.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Live Preview of Visitor Popup Modal */}
          <div className="cv-dash-right">
            <div className="cv-preview-container">
              <div className="cv-preview-bar">
                <span className="preview-label"> Prévia Interativa do Modal</span>
                <span className="preview-sublabel">Como o visitante vê</span>
              </div>

              <div className="cv-modal-preview-shell">
                <div className="cv-modal-content">
                  <div className="cv-modal-header">
                    <div className="cv-modal-title-group">
                      <span className="cv-modal-icon"></span>
                      <div>
                        <h3>Currículo de Matheus de Castro</h3>
                        <p>Escolha o formato que deseja visualizar ou baixar:</p>
                      </div>
                    </div>
                  </div>

                  <div className="cv-modal-options">
                    <a
                      href={cvGoogleDocsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cv-option-card gdocs-card"
                    >
                      <div className="cv-option-text">
                        <div className="cv-option-badge">Versão Web Interativa</div>
                        <h4>Abrir no Google Docs</h4>
                        <p>Visualização instantânea, sempre atualizada com as últimas experiências e projetos.</p>
                      </div>
                      <span className="cv-option-arrow">↗</span>
                    </a>

                    <a
                      href={cvPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cv-option-card pdf-card"
                    >
                      <div className="cv-option-text">
                        <div className="cv-option-badge">Documento Oficial PDF</div>
                        <h4>Baixar Arquivo PDF</h4>
                        <p>Formato clássico ideal para impressão, arquivamento ou anexar em processos seletivos.</p>
                      </div>
                      <span className="cv-option-arrow">↓</span>
                    </a>
                  </div>

                  <div className="cv-modal-footer">
                    <div className="cv-footer-hint">
                      ℹ️ Atualizado em: <strong>{cvUpdatedAt || "Recente"}</strong> • Dual-Mode Docs &amp; PDF
                    </div>
                  </div>
                </div>
              </div>

              <div className="cv-preview-footer-note">
                <em>Você pode clicar nos cards acima para testar seus links exatamente como o visitante!</em>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "drawings" ? (
        <div className="admin-body">
          {/* SIDEBAR: Drawings Explorer */}
          <aside className={`admin-sidebar-explorer ${!isSidebarOpen ? "collapsed" : ""}`}>
            <div className="explorer-header">
              <h3>Meus Desenhos ({items.length})</h3>
              <div className="explorer-header-actions">
                <button
                  type="button"
                  className="btn-new-item"
                  onClick={clearDrawingForm}
                  title="Cadastrar nova arte do zero"
                >
                  + Novo
                </button>
                <button
                  type="button"
                  className="btn-collapse-sidebar"
                  onClick={() => setIsSidebarOpen(false)}
                  title="Recolher barra lateral"
                >
                  ◀
                </button>
              </div>
            </div>

            <div className="explorer-items-list">
              {items.length === 0 ? (
                <div
                  className="explorer-empty-state"
                  style={{
                    padding: "36px 16px",
                    textAlign: "center",
                    color: "#8b949e",
                    fontSize: "13px",
                    lineHeight: "1.5"
                  }}
                >
                  <p style={{ margin: "0 0 8px 0" }}>Nenhum desenho cadastrado.</p>
                  <span style={{ fontSize: "11px", color: "#6e7681" }}>
                    A galeria está vazia. Clique em <b>+ Novo</b> acima para adicionar.
                  </span>
                </div>
              ) : (
                items.map((drawing, idx) => {
                  const isSelected = drawing.id === selectedId;
                  return (
                    <div
                      key={drawing.id || idx}
                      className={`explorer-item-card drawing-sidebar-card ${isSelected ? "selected" : ""}`}
                      onClick={() => loadDrawingIntoForm(drawing)}
                    >
                      <div className="drawing-card-thumb-wrap">
                        {drawing.src ? (
                          <img
                            src={drawing.src}
                            alt={drawing.title}
                            className="drawing-card-thumb-img"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="drawing-card-thumb-placeholder">🖼️</div>
                        )}
                      </div>
                      <div className="drawing-card-info">
                        <div className="item-card-header">
                          <div className="drawing-order-badge-row">
                            <span className="card-order-num">#{idx + 1}</span>
                            <div className="drawing-order-arrows">
                              <button
                                type="button"
                                className="btn-order-arrow"
                                disabled={idx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveDrawing(idx, -1);
                                }}
                                title="Mover para cima"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                className="btn-order-arrow"
                                disabled={idx === items.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveDrawing(idx, 1);
                                }}
                                title="Mover para baixo"
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                          <span className={`drawing-status-pill ${drawing.isPublished !== false ? "published" : "draft"}`}>
                            {drawing.isPublished !== false ? "Publicado" : "Rascunho"}
                          </span>
                        </div>
                        <h4 className="item-card-title">{drawing.title || "Sem título"}</h4>
                        <p className="item-card-desc">
                          {drawing.description || "Sem técnica/descrição"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="delete-item-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDrawing(drawing.id);
                        }}
                        title="Excluir desenho da galeria"
                      >
                        🗑
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="explorer-footer">
              <a
                href="/hobbies#art-gallery"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-reorder-link"
                style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                👁️ Ver Galeria no Site ↗
              </a>
            </div>
          </aside>

          {/* MAIN WORKSPACE FOR DRAWINGS */}
          <main className="admin-editor-workspace">
            <div className="drawings-editor-container">
              {/* Top Banner / Actions */}
              <div className="drawings-top-header">
                <div>
                  <h2>
                    <span></span> Gestão de Desenhos &amp; Galeria
                  </h2>
                  <p className="drawings-subtitle">
                    Adicione, edite e organize os desenhos e artes exibidos em /hobbies. Suporta upload de imagens para Supabase Storage e URLs diretas.
                  </p>
                </div>
                <div className="drawings-header-actions">
                  <button
                    type="button"
                    onClick={clearDrawingForm}
                    className="btn-new-drawing-secondary"
                  >
                    + Novo Desenho
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDrawing}
                    className="btn-save-drawing-primary"
                  >
                    💾 Salvar Desenho
                  </button>
                </div>
              </div>

              {/* 2-Column Grid: Form + Live Preview */}
              <div className="drawings-workspace-grid">
                {/* Form Column */}
                <div className="drawings-form-card">
                  <div className="drawings-card-title">
                    <span>✏️</span> Informações da Arte
                  </div>

                  <form onSubmit={handleSaveDrawing}>
                    <div className="drawings-form-group">
                      <label htmlFor="drawing-title-input">
                        <strong>Título da Obra *</strong>
                      </label>
                      <input
                        id="drawing-title-input"
                        type="text"
                        className="drawings-input"
                        placeholder="Ex: Jack Sparrow em tela A4, Aquaman, GOT..."
                        value={drawingTitle}
                        onChange={(e) => setDrawingTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="drawings-form-group">
                      <label htmlFor="drawing-desc-input">
                        <strong>Técnica / Detalhes (Legenda)</strong>
                      </label>
                      <input
                        id="drawing-desc-input"
                        type="text"
                        className="drawings-input"
                        placeholder="Ex: Arte realista em grafite sobre papel Canson A4..."
                        value={drawingDescription}
                        onChange={(e) => setDrawingDescription(e.target.value)}
                      />
                      <small className="drawings-hint">
                        💡 Exibido como legenda ao abrir o desenho no modo ampliado (lightbox).
                      </small>
                    </div>

                    <div className="drawings-form-group">
                      <label htmlFor="drawing-order-input">
                        <strong>Posição na Ordem de Exibição</strong>
                        <span className="drawings-upload-badge">Posição #{drawingDisplayOrder + 1} de {items.length}</span>
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          id="drawing-order-input"
                          type="number"
                          min="1"
                          max={items.length + 1}
                          className="drawings-input"
                          style={{ width: "90px" }}
                          value={drawingDisplayOrder + 1}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) setDrawingDisplayOrder(Math.max(0, val - 1));
                          }}
                        />
                        <span style={{ fontSize: "12px", color: "#8b949e" }}>
                          Define a posição (#1 aparece primeiro). Você também pode usar as setas ▲ e ▼ na lista lateral.
                        </span>
                      </div>
                    </div>

                    <div className="drawings-form-group">
                      <label>
                        <strong>Upload de Imagem</strong>
                        <span className="drawings-upload-badge">Supabase Storage</span>
                      </label>

                      {/* Dropzone */}
                      <div
                        className={`drawing-dropzone ${isDraggingDrawing ? "dragging" : ""} ${isUploadingDrawing ? "uploading" : ""}`}
                        onDragOver={handleDrawingDragOver}
                        onDragLeave={handleDrawingDragLeave}
                        onDrop={handleDrawingDrop}
                        onClick={() => !isUploadingDrawing && drawingFileInputRef.current?.click()}
                      >
                        <input
                          ref={drawingFileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleDrawingFileInputChange}
                        />
                        {isUploadingDrawing ? (
                          <div className="dropzone-status">
                            <div className="dropzone-spinner"></div>
                            <span>Enviando imagem ao Supabase Storage...</span>
                          </div>
                        ) : (
                          <div className="dropzone-status">
                            <span className="dropzone-icon">🖼️</span>
                            <p className="dropzone-text">
                              <strong>Arraste e solte uma imagem aqui</strong> ou clique para selecionar
                            </p>
                            <span className="dropzone-formats">
                              Formatos aceitos: WebP, PNG, JPG, JPEG, GIF
                            </span>
                          </div>
                        )}
                      </div>

                      {drawingUploadFeedback && (
                        <div className={`drawing-upload-msg ${drawingUploadFeedback.type}`}>
                          {drawingUploadFeedback.type === "success" ? "✅" : "⚠️"} {drawingUploadFeedback.message}
                        </div>
                      )}
                    </div>

                    <div className="drawings-form-group">
                      <label htmlFor="drawing-src-input">
                        <strong>URL ou Caminho da Imagem *</strong>
                      </label>
                      <div className="drawings-url-input-wrap">
                        <input
                          id="drawing-src-input"
                          type="text"
                          className="drawings-input"
                          placeholder="https://... ou preenchido automaticamente pelo upload"
                          value={drawingSrc}
                          onChange={(e) => setDrawingSrc(e.target.value)}
                          required
                        />
                        {drawingSrc && (
                          <a
                            href={drawingSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="drawings-test-url-btn"
                            title="Abrir imagem original em nova aba"
                          >
                            Abrir ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="drawings-form-group checkbox-group">
                      <label className="drawings-checkbox-label">
                        <input
                          type="checkbox"
                          checked={drawingIsPublished}
                          onChange={(e) => setDrawingIsPublished(e.target.checked)}
                        />
                        <span>Publicado (visível para todos os visitantes em /hobbies)</span>
                      </label>
                    </div>

                    <div className="drawings-form-actions">
                      <button type="submit" className="btn-save-drawing-primary">
                        💾 Salvar Alterações
                      </button>
                      {selectedId && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDrawing(selectedId)}
                          className="btn-delete-drawing-danger"
                        >
                          🗑 Excluir Desenho
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Live Preview Column */}
                <div className="drawings-preview-card">
                  <div className="drawings-card-title">
                    <span>👁️</span> Prévia Idêntica ao Portfólio (/hobbies)
                  </div>
                  <div className="drawings-preview-inner">
                    <p className="drawings-preview-explanation">
                      Veja abaixo como sua arte se comportará na galeria masonry e no modal ampliado:
                    </p>

                    {/* Simulation of ArtGallery card */}
                    <div className="drawing-preview-masonry-card">
                      {drawingSrc ? (
                        <div className="art-item-simulation">
                          <img
                            src={drawingSrc}
                            alt={drawingTitle || "Sem título"}
                            className="preview-img-tag"
                          />
                          <div className="art-overlay-simulation">
                            <span>{drawingTitle || "Título da Obra"}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="preview-empty-image">
                          <span>🖼️</span>
                          <p>Nenhuma imagem selecionada ainda.</p>
                          <small>Faça upload acima ou digite uma URL para visualizar a prévia.</small>
                        </div>
                      )}
                    </div>

                    {/* Simulation of Lightbox details */}
                    <div className="drawing-preview-lightbox-details">
                      <div className="preview-lightbox-header">
                        <span className="lightbox-badge">Prévia da Legenda</span>
                        <span className="lightbox-dimensions">
                          {drawingIsPublished ? "🟢 Visível no site" : "🟡 Rascunho privado"}
                        </span>
                      </div>
                      <h3 className="preview-lightbox-title">{drawingTitle || "Título da Obra"}</h3>
                      <p className="preview-lightbox-desc">
                        {drawingDescription || "Técnica e detalhes não informados."}
                      </p>
                      {drawingSrc && (
                        <div className="preview-url-tag">
                          <code>{drawingSrc.startsWith("data:") ? "Imagem local em Base64" : drawingSrc}</code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
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
              {items.length === 0 ? (
                <div
                  className="explorer-empty-state"
                  style={{
                    padding: "36px 16px",
                    textAlign: "center",
                    color: "#8b949e",
                    fontSize: "13px",
                    lineHeight: "1.5"
                  }}
                >
                  <p style={{ margin: "0 0 8px 0" }}>
                    Nenhum {activeTab === "projects" ? "projeto" : activeTab === "articles" ? "artigo" : activeTab === "experiences" ? "cargo" : "pensamento"} cadastrado.
                  </p>
                  <span style={{ fontSize: "11px", color: "#6e7681" }}>
                    A lista está vazia. Clique em <b>+ Novo</b> acima para adicionar.
                  </span>
                </div>
              ) : (
                items.map((item, idx) => {
                  const isSelected = item.id === selectedId;
                  return (
                    <div
                      key={item.id}
                      className={`explorer-item-card ${isSelected ? "selected" : ""}`}
                      onClick={() => loadItemIntoForm(item)}
                    >
                      <div className="item-card-header">
                        <span className="card-order-num">#{idx + 1}</span>
                        <span className="card-category-pill">
                          {activeTab === "experiences" ? (item.company || "Experiência") : item.category}
                        </span>
                      </div>
                      <h4 className="item-card-title">{item.title}</h4>
                      <p className="item-card-desc">
                        {activeTab === "experiences"
                          ? `${item.time || "Período"} • ${item.bullets?.length || 0} atividades`
                          : (item.shortDescription || item.aboutContext || "Sem descrição")}
                      </p>
                      <div className="item-card-footer">
                        <span className="item-format-tag">
                          {activeTab === "experiences"
                            ? " Experiência"
                            : item.contentType === "google-docs"
                            ? " Google Docs"
                            : item.contentType === "pdf"
                            ? " PDF"
                            : " Markdown"}
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
                })
              )}
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
            {activeTab === "experiences" ? (
              <div className="experience-admin-form" style={{ padding: "28px", maxWidth: "960px", margin: "0 auto", width: "100%" }}>
                <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "12px", padding: "24px", marginBottom: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0, color: "#f0f6fc", fontSize: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <span>💼</span> {selectedId ? "Editar Experiência Profissional" : "Nova Experiência"}
                    </h2>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={clearForm}
                        style={{ padding: "8px 14px", background: "#21262d", color: "#c9d1d9", border: "1px solid #30363d", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}
                      >
                        + Novo Cadastro
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveItem}
                        style={{ padding: "8px 18px", background: "#238636", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        💾 Salvar Experiência
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#8b949e" }}>
                        Cargo ou Formação:
                      </label>
                      <input
                        type="text"
                        style={{ width: "100%", fontSize: "15px", padding: "12px", borderRadius: "8px", background: "#0d1117", border: "1px solid #30363d", color: "#fff" }}
                        placeholder="Ex: IT Intern, Backend Developer, Bacharelado em BTI..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#8b949e" }}>
                        Empresa / Órgão / Instituição:
                      </label>
                      <input
                        type="text"
                        style={{ width: "100%", fontSize: "15px", padding: "12px", borderRadius: "8px", background: "#0d1117", border: "1px solid #30363d", color: "#fff" }}
                        placeholder="Ex: Detran, Cachina Soluções, UFRN..."
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#8b949e" }}>
                      Período / Linha do Tempo:
                    </label>
                    <input
                      type="text"
                      style={{ width: "100%", fontSize: "14px", padding: "12px", borderRadius: "8px", background: "#0d1117", border: "1px solid #30363d", color: "#fff" }}
                      placeholder="Ex: Junho 2026 - Atualmente ou 2024.1 - Presente"
                      value={timePeriod}
                      onChange={(e) => setTimePeriod(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#8b949e" }}>
                      Atividades & Conquistas (digite 1 por linha):
                    </label>
                    <textarea
                      rows="6"
                      style={{ width: "100%", fontSize: "14px", padding: "14px", borderRadius: "8px", background: "#0d1117", border: "1px solid #30363d", color: "#fff", lineHeight: "1.6", resize: "vertical" }}
                      placeholder="Ex:&#10;Desenvolvimento e otimização de arquiteturas de backend em Python&#10;Automação de processos com n8n&#10;Gestão de servidores Linux Ubuntu..."
                      value={bulletsText}
                      onChange={(e) => setBulletsText(e.target.value)}
                    />
                    <small style={{ color: "#8b949e", fontSize: "12px", display: "block", marginTop: "6px" }}>
                       Cada linha quebrada será renderizada como um ponto na lista de experiência do portfólio.
                    </small>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div style={{ background: "#0d1117", border: "1px solid rgba(139, 92, 246, 0.4)", borderRadius: "12px", padding: "24px", boxShadow: "0 8px 30px rgba(139, 92, 246, 0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ color: "#a78bfa", fontWeight: "700", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
                       Prévia Idêntica ao Site Oficial
                    </span>
                    <span style={{ fontSize: "12px", color: "#8b949e" }}>Seção &quot;Experiência&quot;</span>
                  </div>

                  <div className="exp-display-card">
                    <div className="exp-card-body">
                      <h3>
                        {title || "Cargo ou Título"} |{" "}
                        <span className="company-highlight">{company || "Empresa"}</span>
                      </h3>
                      <p className="exp-timeline">{timePeriod || "Período / Ano"}</p>
                      <div className="card-inner-divider"></div>
                      <ul className="exp-bullet-list">
                        {(bulletsText.split("\n").map((b) => b.trim()).filter(Boolean).length > 0
                          ? bulletsText.split("\n").map((b) => b.trim()).filter(Boolean)
                          : ["Sua atividade ou responsabilidade aparecerá aqui..."]
                        ).map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
                  {/* Direct Visible Button to Link / Attach Project <-> Article */}
                  {activeTab === "projects" && (
                    <button
                      type="button"
                      className={`btn-attach-relation ${relatedArticleId ? "is-linked" : ""}`}
                      onClick={() => setShowRelationModal(true)}
                      title="Clique para anexar um artigo técnico a este projeto"
                    >
                      🔗 {relatedArticleId ? `Artigo Anexo: ${getStoredArticles().find((a) => a.id === relatedArticleId)?.title.slice(0, 16) || "Vinculado"}...` : "Anexar Artigo"}
                    </button>
                  )}

                  {activeTab === "articles" && (
                    <button
                      type="button"
                      className={`btn-attach-relation ${relatedProjectId ? "is-linked" : ""}`}
                      onClick={() => setShowRelationModal(true)}
                      title="Clique para anexar um projeto prático a este artigo"
                    >
                      🔗 {relatedProjectId ? `Projeto Anexo: ${getStoredProjects().find((p) => p.id === relatedProjectId)?.title.slice(0, 16) || "Vinculado"}...` : "Anexar Projeto"}
                    </button>
                  )}

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

                  {/* Two-way attachment: Project <-> Article */}
                  {activeTab === "projects" && (
                    <div className="meta-attachment-row">
                      <label>🔗 Anexar Artigo Técnico ao Projeto:</label>
                      <div className="attachment-select-wrap">
                        <select
                          value={relatedArticleId}
                          onChange={(e) => setRelatedArticleId(e.target.value)}
                          className="meta-relation-select"
                        >
                          <option value="">Nenhum artigo vinculado</option>
                          {getStoredArticles().map((art) => (
                            <option key={art.id} value={art.id}>
                              📑 {art.title}
                            </option>
                          ))}
                        </select>
                        {relatedArticleId && (
                          <button
                            type="button"
                            className="btn-clear-attachment"
                            onClick={() => setRelatedArticleId("")}
                            title="Remover anexo de artigo"
                          >
                            ✕ Desanexar
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "articles" && (
                    <div className="meta-attachment-row">
                      <label>🔗 Anexar Projeto Prático ao Artigo:</label>
                      <div className="attachment-select-wrap">
                        <select
                          value={relatedProjectId}
                          onChange={(e) => setRelatedProjectId(e.target.value)}
                          className="meta-relation-select"
                        >
                          <option value="">Nenhum projeto vinculado</option>
                          {getStoredProjects().map((p) => (
                            <option key={p.id} value={p.id}>
                              💻 {p.title}
                            </option>
                          ))}
                        </select>
                        {relatedProjectId && (
                          <button
                            type="button"
                            className="btn-clear-attachment"
                            onClick={() => setRelatedProjectId("")}
                            title="Remover anexo de projeto"
                          >
                            ✕ Desanexar
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="meta-synopsis-row">
                    <label>Sinopse / Contexto IA (Resumo destacado na página):</label>
                    <textarea
                      rows="2"
                      placeholder="Breve resumo objetivo que os visitantes e o agente Alomyr usam para contextualizar o projeto..."
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
          </>
        )}
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

      {/* Attachment / Relation Picker Modal */}
      {showRelationModal && (
        <div className="shortcuts-modal-overlay" onClick={() => setShowRelationModal(false)}>
          <div className="relation-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {activeTab === "projects"
                  ? `🔗 Anexar Artigo Técnico ao Projeto: "${title}"`
                  : `🔗 Anexar Projeto Prático ao Artigo: "${title}"`}
              </h3>
              <button className="btn-close-modal" onClick={() => setShowRelationModal(false)}>✕</button>
            </div>

            <div className="relation-modal-body">
              <p className="relation-modal-intro">
                {activeTab === "projects"
                  ? "Selecione o artigo técnico correspondente para que os visitantes possam alternar com um clique entre o repositório/código e a fundamentação teórica."
                  : "Selecione o projeto prático correspondente para que os leitores do artigo possam acessar o código e deploy em produção."}
              </p>

              {activeTab === "projects" ? (
                <div className="relation-items-list">
                  <div
                    className={`relation-item-card ${!relatedArticleId ? "is-active" : ""}`}
                    onClick={() => {
                      setRelatedArticleId("");
                      showToast("Vínculo removido.");
                    }}
                  >
                    <div className="relation-card-info">
                      <strong>🚫 Nenhum artigo anexado</strong>
                      <span>Este projeto não exibirá chamada para artigo técnico.</span>
                    </div>
                    {!relatedArticleId && <span className="relation-active-tag">Ativo</span>}
                  </div>

                  {getStoredArticles().map((art) => (
                    <div
                      key={art.id}
                      className={`relation-item-card ${relatedArticleId === art.id ? "is-active" : ""}`}
                      onClick={() => {
                        setRelatedArticleId(art.id);
                        showToast(`Artigo "${art.title}" anexado ao projeto!`);
                      }}
                    >
                      <div className="relation-card-info">
                        <strong>📑 {art.title}</strong>
                        <span>{art.shortDescription || art.aboutContext || "Sem descrição"}</span>
                      </div>
                      {relatedArticleId === art.id ? (
                        <span className="relation-active-tag">✅ Vinculado</span>
                      ) : (
                        <button type="button" className="btn-select-relation">Vincular</button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relation-items-list">
                  <div
                    className={`relation-item-card ${!relatedProjectId ? "is-active" : ""}`}
                    onClick={() => {
                      setRelatedProjectId("");
                      showToast("Vínculo removido.");
                    }}
                  >
                    <div className="relation-card-info">
                      <strong>🚫 Nenhum projeto anexado</strong>
                      <span>Este artigo não exibirá chamada para projeto prático.</span>
                    </div>
                    {!relatedProjectId && <span className="relation-active-tag">Ativo</span>}
                  </div>

                  {getStoredProjects().map((p) => (
                    <div
                      key={p.id}
                      className={`relation-item-card ${relatedProjectId === p.id ? "is-active" : ""}`}
                      onClick={() => {
                        setRelatedProjectId(p.id);
                        showToast(`Projeto "${p.title}" anexado ao artigo!`);
                      }}
                    >
                      <div className="relation-card-info">
                        <strong>💻 {p.title}</strong>
                        <span>{p.shortDescription || p.aboutContext || "Sem descrição"}</span>
                      </div>
                      {relatedProjectId === p.id ? (
                        <span className="relation-active-tag">✅ Vinculado</span>
                      ) : (
                        <button type="button" className="btn-select-relation">Vincular</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-close-modal-bottom" onClick={() => setShowRelationModal(false)}>
                Concluir & Voltar ao Editor
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
