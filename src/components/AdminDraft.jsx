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

## SEU PAPEL E OBJETIVO
Seu objetivo é orientar visitantes, recrutadores, pesquisadores e parceiros técnicos, apresentando com clareza as qualificações, projetos, publicações e competências técnicas de Matheus de Castro nas áreas de:
- Machine Learning Engineering & Deep Learning (PyTorch, Visão Computacional, U-Net)
- Arquitetura de Backend & Engenharia de Software (Python, FastAPI, PostgreSQL, Docker)
- Automação de Fluxos de Trabalho Inteligentes (n8n, Linux Ubuntu Server, Bash)
- Formação Acadêmica: Bacharelado em Tecnologia da Informação (BTI) na UFRN e Técnico em TI pelo IFRN.

## DIRETRIZES RÍGIDAS DE COMPORTAMENTO
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

  // Language for editing in Admin
  const [activeEditorLang, setActiveEditorLang] = useState("en"); // 'en' | 'pt'

  // Form states
  const [title, setTitle] = useState(() => initialItem?.title || "");
  const [titleEn, setTitleEn] = useState(() => initialItem?.titleEn || initialItem?.title || "");
  const [titlePt, setTitlePt] = useState(() => initialItem?.titlePt || initialItem?.title || "");
  const [category, setCategory] = useState(() => initialItem?.category || "Profissional");
  const [tags, setTags] = useState(() => (Array.isArray(initialItem?.tags) ? initialItem.tags.join(", ") : initialItem?.tags || ""));
  const [shortDescription, setShortDescription] = useState(() => initialItem?.shortDescription || "");
  const [shortDescriptionEn, setShortDescriptionEn] = useState(() => initialItem?.shortDescriptionEn || initialItem?.shortDescription || "");
  const [shortDescriptionPt, setShortDescriptionPt] = useState(() => initialItem?.shortDescriptionPt || initialItem?.shortDescription || "");
  const [aboutContext, setAboutContext] = useState(() => initialItem?.aboutContext || "");
  const [aboutContextEn, setAboutContextEn] = useState(() => initialItem?.aboutContextEn || initialItem?.aboutContext || "");
  const [aboutContextPt, setAboutContextPt] = useState(() => initialItem?.aboutContextPt || initialItem?.aboutContext || "");
  const [githubUrl, setGithubUrl] = useState(() => initialItem?.github || "");
  const [demoUrl, setDemoUrl] = useState(() => initialItem?.demo || "");
  const [contentType, setContentType] = useState(() => initialItem?.contentType || "markdown");
  const [googleDocsUrl, setGoogleDocsUrl] = useState(() => initialItem?.googleDocsUrl || "");
  const [pdfUrl, setPdfUrl] = useState(() => initialItem?.pdfUrl || "");
  const [markdownContent, setMarkdownContent] = useState(() => initialItem?.content || "");
  const [markdownContentEn, setMarkdownContentEn] = useState(() => initialItem?.contentEn || initialItem?.content || "");
  const [markdownContentPt, setMarkdownContentPt] = useState(() => initialItem?.contentPt || initialItem?.content || "");
  const [relatedArticleId, setRelatedArticleId] = useState(() => initialItem?.relatedArticleId || "");
  const [relatedProjectId, setRelatedProjectId] = useState(() => initialItem?.relatedProjectId || "");

  // Experience states
  const [expPreviewLang, setExpPreviewLang] = useState("en");
  const [company, setCompany] = useState(() => initialItem?.company || "");
  const [timePeriod, setTimePeriod] = useState(() => initialItem?.time || "");
  const [timePeriodEn, setTimePeriodEn] = useState(() => initialItem?.timeEn || initialItem?.time || "");
  const [timePeriodPt, setTimePeriodPt] = useState(() => initialItem?.timePt || initialItem?.time || "");
  const [bulletsText, setBulletsText] = useState(() => (Array.isArray(initialItem?.bullets) ? initialItem.bullets.join("\n") : ""));
  const [bulletsTextEn, setBulletsTextEn] = useState(() => (Array.isArray(initialItem?.bulletsEn) ? initialItem.bulletsEn.join("\n") : (Array.isArray(initialItem?.bullets) ? initialItem.bullets.join("\n") : "")));
  const [bulletsTextPt, setBulletsTextPt] = useState(() => (Array.isArray(initialItem?.bulletsPt) ? initialItem.bulletsPt.join("\n") : (Array.isArray(initialItem?.bullets) ? initialItem.bullets.join("\n") : "")));

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

  // CV Dual-Mode Bilingual States (Google Docs & PDF for EN and PT)
  const [cvActiveLang, setCvActiveLang] = useState("en"); // 'en' | 'pt'
  const [cvGoogleDocsUrlEn, setCvGoogleDocsUrlEn] = useState(() => getStoredCvConfig().googleDocsUrlEn || getStoredCvConfig().googleDocsUrl || "");
  const [cvGoogleDocsUrlPt, setCvGoogleDocsUrlPt] = useState(() => getStoredCvConfig().googleDocsUrlPt || getStoredCvConfig().googleDocsUrl || "");
  const [cvPdfUrlEn, setCvPdfUrlEn] = useState(() => getStoredCvConfig().pdfUrlEn || getStoredCvConfig().pdfUrl || "");
  const [cvPdfUrlPt, setCvPdfUrlPt] = useState(() => getStoredCvConfig().pdfUrlPt || getStoredCvConfig().pdfUrl || "");
  const [cvUpdatedAt, setCvUpdatedAt] = useState(() => getStoredCvConfig().updatedAt || new Date().toISOString().split("T")[0]);
  const [isUploadingCvPdfEn, setIsUploadingCvPdfEn] = useState(false);
  const [isUploadingCvPdfPt, setIsUploadingCvPdfPt] = useState(false);
  const [isDraggingCvPdfEn, setIsDraggingCvPdfEn] = useState(false);
  const [isDraggingCvPdfPt, setIsDraggingCvPdfPt] = useState(false);
  const [cvUploadFeedbackEn, setCvUploadFeedbackEn] = useState(null);
  const [cvUploadFeedbackPt, setCvUploadFeedbackPt] = useState(null);
  const [cvPreviewLang, setCvPreviewLang] = useState("en");
  const cvFileInputEnRef = useRef(null);
  const cvFileInputPtRef = useRef(null);

  // Drawings states
  const [drawingTitle, setDrawingTitle] = useState("");
  const [drawingTitleEn, setDrawingTitleEn] = useState("");
  const [drawingTitlePt, setDrawingTitlePt] = useState("");
  const [drawingSrc, setDrawingSrc] = useState("");
  const [drawingDescription, setDrawingDescription] = useState("");
  const [drawingDescriptionEn, setDrawingDescriptionEn] = useState("");
  const [drawingDescriptionPt, setDrawingDescriptionPt] = useState("");
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
          setCvGoogleDocsUrlEn(cfg.googleDocsUrlEn || cfg.googleDocsUrl || "");
          setCvGoogleDocsUrlPt(cfg.googleDocsUrlPt || cfg.googleDocsUrl || "");
          setCvPdfUrlEn(cfg.pdfUrlEn || cfg.pdfUrl || "");
          setCvPdfUrlPt(cfg.pdfUrlPt || cfg.pdfUrl || "");
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
    setTitleEn(item.titleEn || item.title || "");
    setTitlePt(item.titlePt || item.title || "");
    setCategory(item.category || "Profissional");
    setTags(Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "");
    setShortDescription(item.shortDescription || "");
    setShortDescriptionEn(item.shortDescriptionEn || item.shortDescription || "");
    setShortDescriptionPt(item.shortDescriptionPt || item.shortDescription || "");
    setAboutContext(item.aboutContext || "");
    setAboutContextEn(item.aboutContextEn || item.aboutContext || "");
    setAboutContextPt(item.aboutContextPt || item.aboutContext || "");
    setGithubUrl(item.github || "");
    setDemoUrl(item.demo || "");
    setContentType(item.contentType || "markdown");
    setGoogleDocsUrl(item.googleDocsUrl || "");
    setPdfUrl(item.pdfUrl || "");
    setMarkdownContent(item.content || "");
    setMarkdownContentEn(item.contentEn || item.content || "");
    setMarkdownContentPt(item.contentPt || item.content || "");
    setRelatedArticleId(item.relatedArticleId || "");
    setRelatedProjectId(item.relatedProjectId || "");
    setCompany(item.company || "");
    setTimePeriod(item.time || "");
    setTimePeriodEn(item.timeEn || item.time || "");
    setTimePeriodPt(item.timePt || item.time || "");
    setBulletsText(Array.isArray(item.bullets) ? item.bullets.join("\n") : item.bullets || "");
    setBulletsTextEn(Array.isArray(item.bulletsEn) ? item.bulletsEn.join("\n") : (Array.isArray(item.bullets) ? item.bullets.join("\n") : ""));
    setBulletsTextPt(Array.isArray(item.bulletsPt) ? item.bulletsPt.join("\n") : (Array.isArray(item.bullets) ? item.bullets.join("\n") : ""));
  };

  const clearForm = () => {
    setSelectedId(null);
    setTitle("");
    setTitleEn("");
    setTitlePt("");
    setCategory(activeTab === "articles" ? "Acadêmico" : "Profissional");
    setTags("");
    setShortDescription("");
    setShortDescriptionEn("");
    setShortDescriptionPt("");
    setAboutContext("");
    setAboutContextEn("");
    setAboutContextPt("");
    setGithubUrl("");
    setDemoUrl("");
    setContentType(activeTab === "articles" ? "google-docs" : "markdown");
    setGoogleDocsUrl("");
    setPdfUrl("");
    setMarkdownContent("");
    setMarkdownContentEn("");
    setMarkdownContentPt("");
    setRelatedArticleId("");
    setRelatedProjectId("");
    setCompany("");
    setTimePeriod("");
    setTimePeriodEn("");
    setTimePeriodPt("");
    setBulletsText("");
    setBulletsTextEn("");
    setBulletsTextPt("");
  };

  const loadDrawingIntoForm = (item) => {
    setSelectedId(item.id);
    setDrawingTitle(item.title || "");
    setDrawingTitleEn(item.titleEn || item.title || "");
    setDrawingTitlePt(item.titlePt || item.title || "");
    setDrawingSrc(item.src || "");
    setDrawingDescription(item.description || "");
    setDrawingDescriptionEn(item.descriptionEn || item.description || "");
    setDrawingDescriptionPt(item.descriptionPt || item.description || "");
    setDrawingIsPublished(item.isPublished !== false);
    setDrawingDisplayOrder(item.displayOrder ?? 0);
    setDrawingUploadFeedback(null);
  };

  const clearDrawingForm = () => {
    setSelectedId(null);
    setDrawingTitle("");
    setDrawingTitleEn("");
    setDrawingTitlePt("");
    setDrawingSrc("");
    setDrawingDescription("");
    setDrawingDescriptionEn("");
    setDrawingDescriptionPt("");
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
    const cleanDocsEn = cvGoogleDocsUrlEn.trim();
    const cleanDocsPt = cvGoogleDocsUrlPt.trim();
    const cleanPdfEn = cvPdfUrlEn.trim();
    const cleanPdfPt = cvPdfUrlPt.trim();
    const newConfig = {
      googleDocsUrlEn: cleanDocsEn,
      googleDocsUrlPt: cleanDocsPt,
      googleDocsUrl: cleanDocsEn || cleanDocsPt,
      pdfUrlEn: cleanPdfEn,
      pdfUrlPt: cleanPdfPt,
      pdfUrl: cleanPdfEn || cleanPdfPt,
      updatedAt: cvUpdatedAt || new Date().toISOString().split("T")[0]
    };
    const res = await persistCvConfig(newConfig);
    showToast(
      res.cloud
        ? "Configurações bilíngues do Currículo sincronizadas no Supabase!"
        : "Configurações bilíngues do Currículo salvas localmente (offline)!"
    );
  };

  const handleResetCv = () => {
    if (window.confirm("Deseja restaurar as configurações padrão do currículo?")) {
      saveCvConfig(DEFAULT_CV_CONFIG);
      setCvGoogleDocsUrlEn(DEFAULT_CV_CONFIG.googleDocsUrlEn);
      setCvGoogleDocsUrlPt(DEFAULT_CV_CONFIG.googleDocsUrlPt);
      setCvPdfUrlEn(DEFAULT_CV_CONFIG.pdfUrlEn);
      setCvPdfUrlPt(DEFAULT_CV_CONFIG.pdfUrlPt);
      setCvUpdatedAt(DEFAULT_CV_CONFIG.updatedAt);
      showToast("Configurações do currículo restauradas para o padrão.");
    }
  };

  const handleProcessCvFile = async (file, targetLang = cvActiveLang) => {
    if (!file) return;
    const isPdf = file.name?.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
    const isEn = targetLang === "en";
    const setFeedback = isEn ? setCvUploadFeedbackEn : setCvUploadFeedbackPt;
    const setUploading = isEn ? setIsUploadingCvPdfEn : setIsUploadingCvPdfPt;
    const setPdfUrl = isEn ? setCvPdfUrlEn : setCvPdfUrlPt;

    if (!isPdf) {
      setFeedback({
        type: "error",
        message: "Apenas arquivos em formato PDF (.pdf) são permitidos para o Currículo."
      });
      return;
    }

    try {
      setUploading(true);
      setFeedback(null);
      const res = await uploadCvPdf(file, targetLang);
      setPdfUrl(res.publicUrl);
      if (res.config?.updatedAt) {
        setCvUpdatedAt(res.config.updatedAt);
      }
      setFeedback({
        type: "success",
        message: `Novo PDF em ${isEn ? "Inglês" : "Português"} "${file.name}" enviado com sucesso!`
      });
      showToast(`Novo PDF do CV (${isEn ? "EN" : "PT"}) enviado com sucesso!`);
    } catch (err) {
      console.error("Falha ao subir CV PDF:", err);
      setFeedback({
        type: "error",
        message: err.message || "Erro ao enviar o PDF para o Supabase Storage."
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCvDragOver = (e, targetLang = "en") => {
    e.preventDefault();
    e.stopPropagation();
    if (targetLang === "en") setIsDraggingCvPdfEn(true);
    else setIsDraggingCvPdfPt(true);
  };

  const handleCvDragLeave = (e, targetLang = "en") => {
    e.preventDefault();
    e.stopPropagation();
    if (targetLang === "en") setIsDraggingCvPdfEn(false);
    else setIsDraggingCvPdfPt(false);
  };

  const handleCvDrop = (e, targetLang = "en") => {
    e.preventDefault();
    e.stopPropagation();
    if (targetLang === "en") setIsDraggingCvPdfEn(false);
    else setIsDraggingCvPdfPt(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleProcessCvFile(files[0], targetLang);
    }
  };

  const handleCvFileInputChange = (e, targetLang = "en") => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessCvFile(files[0], targetLang);
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
      showToast(res.cloud ? "Imagem enviada ao Supabase Storage!" : "Imagem carregada (offline)!");
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
        ? "Ordem dos desenhos atualizada no Supabase!"
        : "Ordem dos desenhos atualizada localmente!"
    );
  };

  const handleSaveDrawing = async (e) => {
    if (e) e.preventDefault();
    const resolvedTitle = drawingTitleEn.trim() || drawingTitlePt.trim() || drawingTitle.trim();
    if (!resolvedTitle) {
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
      title: resolvedTitle,
      titleEn: drawingTitleEn.trim() || resolvedTitle,
      titlePt: drawingTitlePt.trim() || resolvedTitle,
      src: drawingSrc.trim(),
      description: drawingDescriptionEn.trim() || drawingDescriptionPt.trim() || drawingDescription.trim(),
      descriptionEn: drawingDescriptionEn.trim() || drawingDescription.trim(),
      descriptionPt: drawingDescriptionPt.trim() || drawingDescription.trim(),
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
        ? "Desenho salvo e ordem sincronizada no Supabase!"
        : "Desenho salvo localmente (offline)!"
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
    const currentActiveContent = activeEditorLang === "en" ? markdownContentEn : markdownContentPt;
    if (
      currentActiveContent &&
      currentActiveContent.length > 50 &&
      !window.confirm(
        `Deseja carregar o modelo "${tpl.name}"? O conteúdo atual do editor será substituído.`
      )
    ) {
      return;
    }
    const cleanTplTitle = tpl.name.replace(/^[^\s]+\s/, "");
    setTitle(cleanTplTitle);
    setTitleEn(cleanTplTitle);
    setTitlePt(cleanTplTitle);
    setCategory(tpl.category);
    setTags(tpl.defaultTags);
    setShortDescription(tpl.defaultSummary);
    setShortDescriptionEn(tpl.defaultSummary);
    setShortDescriptionPt(tpl.defaultSummary);
    setAboutContext(tpl.defaultSummary);
    setAboutContextEn(tpl.defaultSummary);
    setAboutContextPt(tpl.defaultSummary);
    setContentType("markdown");
    setMarkdownContent(tpl.content);
    setMarkdownContentEn(tpl.content);
    setMarkdownContentPt(tpl.content);
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
          updateCurrentMarkdown(newText);
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
          updateCurrentMarkdown(newText);
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
          updateCurrentMarkdown(newText);
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

  const updateCurrentMarkdown = (newText) => {
    if (activeEditorLang === "en") {
      setMarkdownContentEn(newText);
      setMarkdownContent(newText);
    } else {
      setMarkdownContentPt(newText);
      if (!markdownContentEn) setMarkdownContent(newText);
    }
  };

  const replaceSelection = (insertion, cursorStart, cursorEnd) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, start) + insertion + text.substring(end);
    updateCurrentMarkdown(newText);

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
    updateCurrentMarkdown(newText);

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
    const resolvedTitle = titleEn.trim() || titlePt.trim() || title.trim();
    if (!resolvedTitle) {
      alert(activeTab === "experiences" ? "Por favor, preencha o cargo ou formação." : "Por favor, preencha o título do item.");
      return;
    }

    if (activeTab === "experiences") {
      const bulletsArrayEn = bulletsTextEn.split("\n").map((b) => b.trim()).filter(Boolean);
      const bulletsArrayPt = bulletsTextPt.split("\n").map((b) => b.trim()).filter(Boolean);
      const fallbackBullets = bulletsArrayEn.length > 0 ? bulletsArrayEn : bulletsArrayPt;

      const expItem = {
        id: selectedId || generateUniqueId(),
        title: resolvedTitle,
        titleEn: titleEn.trim() || resolvedTitle,
        titlePt: titlePt.trim() || resolvedTitle,
        company: company || "Empresa / Instituição",
        time: timePeriodEn.trim() || timePeriodPt.trim() || timePeriod || "Período",
        timeEn: timePeriodEn.trim() || timePeriod || "Period",
        timePt: timePeriodPt.trim() || timePeriod || "Período",
        bullets: fallbackBullets,
        bulletsEn: bulletsArrayEn.length > 0 ? bulletsArrayEn : fallbackBullets,
        bulletsPt: bulletsArrayPt.length > 0 ? bulletsArrayPt : fallbackBullets,
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
          ? "Experiência profissional salva no Supabase!"
          : "Experiência salva localmente (offline)!"
      );
      return;
    }

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const resolvedShortDesc = shortDescriptionEn.trim() || shortDescriptionPt.trim() || shortDescription.trim();
    const resolvedAbout = aboutContextEn.trim() || aboutContextPt.trim() || aboutContext.trim() || resolvedShortDesc;
    const resolvedContent = markdownContentEn || markdownContentPt || markdownContent;

    const updatedItem = {
      id: selectedId || generateUniqueId(),
      title: resolvedTitle,
      titleEn: titleEn.trim() || resolvedTitle,
      titlePt: titlePt.trim() || resolvedTitle,
      category,
      tags: tagsArray,
      shortDescription: resolvedShortDesc,
      shortDescriptionEn: shortDescriptionEn.trim() || resolvedShortDesc,
      shortDescriptionPt: shortDescriptionPt.trim() || resolvedShortDesc,
      aboutContext: resolvedAbout,
      aboutContextEn: aboutContextEn.trim() || resolvedAbout,
      aboutContextPt: aboutContextPt.trim() || resolvedAbout,
      github: githubUrl,
      demo: demoUrl,
      contentType,
      googleDocsUrl,
      pdfUrl,
      content: resolvedContent,
      contentEn: markdownContentEn || resolvedContent,
      contentPt: markdownContentPt || resolvedContent,
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
          ? "Projeto salvo e sincronizado no Supabase!"
          : "Projeto salvo localmente (offline)!"
      );
    } else if (activeTab === "articles") {
      const res = await persistArticle(updatedItem);
      showToast(
        res.cloud
          ? "Artigo técnico salvo no Supabase!"
          : "Artigo técnico salvo localmente (offline)!"
      );
    } else {
      const res = await persistThought(updatedItem);
      showToast(
        res.cloud
          ? "Pensamento salvo no Supabase!"
          : "Pensamento salvo localmente (offline)!"
      );
    }
  };

  // Save Agent Prompt
  const handleSaveAgentPrompt = async () => {
    const res = await persistAgentConfig(agentPrompt);
    showToast(
      res.cloud
        ? "System Prompt salvo e sincronizado no Supabase!"
        : "Prompt do Agente salvo localmente!"
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
  const activeMarkdown = activeEditorLang === "en" ? (markdownContentEn || markdownContent) : (markdownContentPt || markdownContent);
  const wordCount = activeMarkdown.trim() ? activeMarkdown.trim().split(/\s+/).length : 0;
  const charCount = activeMarkdown.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 180));
  const embedGoogleDocsUrl = convertGoogleDocsToEmbedUrl(googleDocsUrl);

  const currentItemObject = {
    id: selectedId,
    title: titleEn || titlePt || title,
    titleEn: titleEn || title,
    titlePt: titlePt || title,
    category,
    tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    shortDescription: shortDescriptionEn || shortDescriptionPt || shortDescription,
    shortDescriptionEn: shortDescriptionEn || shortDescription,
    shortDescriptionPt: shortDescriptionPt || shortDescription,
    aboutContext: aboutContextEn || aboutContextPt || shortDescriptionEn || shortDescriptionPt || aboutContext,
    aboutContextEn: aboutContextEn || shortDescriptionEn || aboutContext,
    aboutContextPt: aboutContextPt || shortDescriptionPt || aboutContext,
    github: githubUrl,
    demo: demoUrl,
    contentType,
    googleDocsUrl,
    pdfUrl,
    content: markdownContentEn || markdownContentPt || markdownContent,
    contentEn: markdownContentEn || markdownContent,
    contentPt: markdownContentPt || markdownContent,
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
            {isSupabaseConfigured ? "Supabase Cloud" : "Modo Offline"}
          </div>
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#8b949e", background: "#161b22", padding: "4px 10px", borderRadius: "6px", border: "1px solid #30363d" }}>
              <span>{currentUser.email}</span>
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
                  <span className="spec-icon"></span>
                  <div>
                    <strong>Onde será hospedado</strong>
                    <p>Supabase Edge Functions (Deno Runtime com deploy na borda)</p>
                  </div>
                </div>
                <div className="spec-card">
                  <span className="spec-icon"></span>
                  <div>
                    <strong>Segurança de Chaves</strong>
                    <p>Secret <code>QWEN_API_KEY</code> isolado nos Secrets do Supabase</p>
                  </div>
                </div>
                <div className="spec-card">
                  <span className="spec-icon"></span>
                  <div>
                    <strong>Consumo de Informações</strong>
                    <p>Injeção direta do JSON de projetos, artigos e experiências no payload de contexto</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="agent-card-section prompt-editor-section">
              <div className="agent-section-header">
                <h3>System Prompt do Agente (Rígido)</h3>
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
                    Salvar Prompt
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
                  <h2>Gestão do Currículo Bilíngue (EN / PT)</h2>
                  <p className="cv-section-subtitle">
                    Configure os links e envie os PDFs do seu currículo em <strong>Inglês</strong> e em <strong>Português</strong>. O visitante será direcionado diretamente ao formato correspondente ao idioma ativo no site.
                  </p>
                </div>
                <div className="cv-status-badge">
                  <span className="cv-status-dot"></span> Suporte Bilíngue Ativo
                </div>
              </div>

              {/* Language Switcher for CV Editor */}
              <div className="admin-lang-switcher" style={{ marginBottom: "20px" }}>
                <button
                  type="button"
                  className={`admin-lang-btn ${cvActiveLang === "en" ? "active" : ""}`}
                  onClick={() => setCvActiveLang("en")}
                >
                  EN (English Resume)
                </button>
                <button
                  type="button"
                  className={`admin-lang-btn ${cvActiveLang === "pt" ? "active" : ""}`}
                  onClick={() => setCvActiveLang("pt")}
                >
                  PT (Currículo em Português)
                </button>
              </div>

              <form onSubmit={handleSaveCv} className="cv-form">
                {cvActiveLang === "en" ? (
                  <>
                    <div className="cv-form-group">
                      <label htmlFor="cv-docs-url-en">
                        <span className="label-icon"></span>
                        <strong>Versão Web Interativa em Inglês (Google Docs)</strong>
                        <span className="cv-input-badge docs-badge">EN - International</span>
                      </label>
                      <p className="cv-field-hint">
                        Link público do seu currículo em inglês no Google Docs. Ideal para recrutadores internacionais.
                      </p>
                      <div className="cv-input-with-action">
                        <input
                          id="cv-docs-url-en"
                          type="url"
                          className="cv-input"
                          placeholder="https://docs.google.com/document/d/.../edit?usp=sharing"
                          value={cvGoogleDocsUrlEn}
                          onChange={(e) => setCvGoogleDocsUrlEn(e.target.value)}
                          required
                        />
                        {cvGoogleDocsUrlEn && (
                          <a
                            href={cvGoogleDocsUrlEn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cv-action-test-btn docs-btn"
                            title="Abrir no Google Docs em nova aba"
                          >
                            Abrir Docs (EN) ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="cv-form-group">
                      <label htmlFor="cv-pdf-url-en">
                        <span className="label-icon"></span>
                        <strong>Documento Oficial em Inglês (Arquivo PDF)</strong>
                        <span className="cv-input-badge pdf-badge">Upload Direto (EN)</span>
                      </label>
                      <p className="cv-field-hint">
                        Arraste o PDF do currículo em inglês para fazer upload direto no Supabase Storage.
                      </p>

                      <div
                        className={`cv-pdf-dropzone ${isDraggingCvPdfEn ? "dragging" : ""} ${isUploadingCvPdfEn ? "uploading" : ""}`}
                        onDragOver={(e) => handleCvDragOver(e, "en")}
                        onDragLeave={(e) => handleCvDragLeave(e, "en")}
                        onDrop={(e) => handleCvDrop(e, "en")}
                        onClick={() => !isUploadingCvPdfEn && cvFileInputEnRef.current?.click()}
                        title="Clique ou arraste um PDF em inglês aqui"
                      >
                        <input
                          ref={cvFileInputEnRef}
                          type="file"
                          accept=".pdf,application/pdf"
                          style={{ display: "none" }}
                          onChange={(e) => handleCvFileInputChange(e, "en")}
                        />
                        <div className="cv-dropzone-inner">
                          {isUploadingCvPdfEn ? (
                            <div className="cv-dropzone-status">
                              <div className="cv-dropzone-spinner"></div>
                              <span>Enviando PDF em Inglês para o Supabase...</span>
                            </div>
                          ) : (
                            <>
                              <div className="cv-dropzone-icon"></div>
                              <div className="cv-dropzone-text">
                                <strong>Arraste o PDF em Inglês aqui</strong> ou <u>clique para navegar</u>
                              </div>
                              <span className="cv-dropzone-badge">Somente arquivos .pdf • Versão Internacional</span>
                            </>
                          )}
                        </div>
                      </div>

                      {cvUploadFeedbackEn && (
                        <div className={`cv-upload-feedback-box ${cvUploadFeedbackEn.type}`}>
                          <span>{cvUploadFeedbackEn.message}</span>
                        </div>
                      )}

                      <div className="cv-input-with-action" style={{ marginTop: "12px" }}>
                        <input
                          id="cv-pdf-url-en"
                          type="text"
                          className="cv-input"
                          placeholder="URL do PDF em Inglês"
                          value={cvPdfUrlEn}
                          onChange={(e) => setCvPdfUrlEn(e.target.value)}
                          required
                        />
                        {cvPdfUrlEn && (
                          <a
                            href={cvPdfUrlEn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cv-action-test-btn pdf-btn"
                            title="Testar visualização do PDF (EN)"
                          >
                            Abrir PDF (EN) ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="cv-form-group">
                      <label htmlFor="cv-docs-url-pt">
                        <span className="label-icon"></span>
                        <strong>Versão Web Interativa em Português (Google Docs)</strong>
                        <span className="cv-input-badge docs-badge">PT - Nacional</span>
                      </label>
                      <p className="cv-field-hint">
                        Link público do seu currículo em português no Google Docs. Ideal para recrutadores no Brasil.
                      </p>
                      <div className="cv-input-with-action">
                        <input
                          id="cv-docs-url-pt"
                          type="url"
                          className="cv-input"
                          placeholder="https://docs.google.com/document/d/.../edit?usp=sharing"
                          value={cvGoogleDocsUrlPt}
                          onChange={(e) => setCvGoogleDocsUrlPt(e.target.value)}
                          required
                        />
                        {cvGoogleDocsUrlPt && (
                          <a
                            href={cvGoogleDocsUrlPt}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cv-action-test-btn docs-btn"
                            title="Abrir no Google Docs em nova aba"
                          >
                            Abrir Docs (PT) ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="cv-form-group">
                      <label htmlFor="cv-pdf-url-pt">
                        <span className="label-icon"></span>
                        <strong>Documento Oficial em Português (Arquivo PDF)</strong>
                        <span className="cv-input-badge pdf-badge">Upload Direto (PT)</span>
                      </label>
                      <p className="cv-field-hint">
                        Arraste o PDF do currículo em português para fazer upload direto no Supabase Storage.
                      </p>

                      <div
                        className={`cv-pdf-dropzone ${isDraggingCvPdfPt ? "dragging" : ""} ${isUploadingCvPdfPt ? "uploading" : ""}`}
                        onDragOver={(e) => handleCvDragOver(e, "pt")}
                        onDragLeave={(e) => handleCvDragLeave(e, "pt")}
                        onDrop={(e) => handleCvDrop(e, "pt")}
                        onClick={() => !isUploadingCvPdfPt && cvFileInputPtRef.current?.click()}
                        title="Clique ou arraste um PDF em português aqui"
                      >
                        <input
                          ref={cvFileInputPtRef}
                          type="file"
                          accept=".pdf,application/pdf"
                          style={{ display: "none" }}
                          onChange={(e) => handleCvFileInputChange(e, "pt")}
                        />
                        <div className="cv-dropzone-inner">
                          {isUploadingCvPdfPt ? (
                            <div className="cv-dropzone-status">
                              <div className="cv-dropzone-spinner"></div>
                              <span>Enviando PDF em Português para o Supabase...</span>
                            </div>
                          ) : (
                            <>
                              <div className="cv-dropzone-icon"></div>
                              <div className="cv-dropzone-text">
                                <strong>Arraste o PDF em Português aqui</strong> ou <u>clique para navegar</u>
                              </div>
                              <span className="cv-dropzone-badge">Somente arquivos .pdf • Versão Nacional</span>
                            </>
                          )}
                        </div>
                      </div>

                      {cvUploadFeedbackPt && (
                        <div className={`cv-upload-feedback-box ${cvUploadFeedbackPt.type}`}>
                          <span>{cvUploadFeedbackPt.message}</span>
                        </div>
                      )}

                      <div className="cv-input-with-action" style={{ marginTop: "12px" }}>
                        <input
                          id="cv-pdf-url-pt"
                          type="text"
                          className="cv-input"
                          placeholder="URL do PDF em Português"
                          value={cvPdfUrlPt}
                          onChange={(e) => setCvPdfUrlPt(e.target.value)}
                          required
                        />
                        {cvPdfUrlPt && (
                          <a
                            href={cvPdfUrlPt}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cv-action-test-btn pdf-btn"
                            title="Testar visualização do PDF (PT)"
                          >
                            Abrir PDF (PT) ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="cv-form-group">
                  <label htmlFor="cv-updated-at">
                    <span className="label-icon"></span>
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
                    Exibida no rodapé do modal para garantir ao visitante que as duas versões estão atualizadas.
                  </small>
                </div>

                <div className="cv-form-actions">
                  <button type="submit" className="btn-save-cv-primary">
                    Salvar Configurações Bilíngues do CV
                  </button>
                  <button type="button" onClick={handleResetCv} className="btn-reset-cv-secondary">
                    Restaurar Padrões
                  </button>
                </div>
              </form>
            </div>

            <div className="cv-info-card">
              <h3>Fluxo de Redirecionamento Automático</h3>
              <ul className="cv-flow-list">
                <li>
                  <span className="step-num">1</span>
                  <span>Se o site estiver em <strong>Português (PT)</strong>, o modal abre automaticamente com os links do Docs e PDF em português.</span>
                </li>
                <li>
                  <span className="step-num">2</span>
                  <span>Se o site for alternado para <strong>Inglês (EN)</strong>, o modal atualiza instantaneamente para a versão internacional.</span>
                </li>
                <li>
                  <span className="step-num">3</span>
                  <span>O visitante também pode alternar entre <strong>EN</strong> e <strong>PT</strong> diretamente dentro do próprio modal.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Live Preview of Visitor Popup Modal */}
          <div className="cv-dash-right">
            <div className="cv-preview-container">
              <div className="cv-preview-bar">
                <span className="preview-label">Prévia Interativa do Modal</span>
                <div className="cv-modal-lang-toggle" style={{ marginLeft: "auto" }}>
                  <button
                    type="button"
                    className={`cv-lang-chip ${cvPreviewLang === "en" ? "active" : ""}`}
                    onClick={() => setCvPreviewLang("en")}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    className={`cv-lang-chip ${cvPreviewLang === "pt" ? "active" : ""}`}
                    onClick={() => setCvPreviewLang("pt")}
                  >
                    PT
                  </button>
                </div>
              </div>

              <div className="cv-modal-preview-shell">
                <div className="cv-modal-content">
                  <div className="cv-modal-header">
                    <div className="cv-modal-title-group">
                      <span className="cv-modal-icon"></span>
                      <div>
                        <h3>{cvPreviewLang === "en" ? "Matheus de Castro's Resume" : "Currículo de Matheus de Castro"}</h3>
                        <p>{cvPreviewLang === "en" ? "Choose the format you wish to view or download:" : "Escolha o formato que deseja visualizar ou baixar:"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="cv-modal-options">
                    <a
                      href={cvPreviewLang === "en" ? (cvGoogleDocsUrlEn || cvGoogleDocsUrlPt) : (cvGoogleDocsUrlPt || cvGoogleDocsUrlEn)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cv-option-card gdocs-card"
                    >
                      <div className="cv-option-text">
                        <div className="cv-option-badge">
                          {cvPreviewLang === "en" ? "Interactive Web Version (EN)" : "Versão Web Interativa (PT)"}
                        </div>
                        <h4>{cvPreviewLang === "en" ? "Open in Google Docs" : "Abrir no Google Docs"}</h4>
                        <p>{cvPreviewLang === "en" ? "Instant preview, always updated with the latest experiences and projects." : "Visualização instantânea, sempre atualizada com as últimas experiências e projetos."}</p>
                      </div>
                      <span className="cv-option-arrow">↗</span>
                    </a>

                    <a
                      href={cvPreviewLang === "en" ? (cvPdfUrlEn || cvPdfUrlPt) : (cvPdfUrlPt || cvPdfUrlEn)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cv-option-card pdf-card"
                    >
                      <div className="cv-option-text">
                        <div className="cv-option-badge">
                          {cvPreviewLang === "en" ? "Official PDF Document (EN)" : "Documento Oficial PDF (PT)"}
                        </div>
                        <h4>{cvPreviewLang === "en" ? "Download PDF File" : "Baixar Arquivo PDF"}</h4>
                        <p>{cvPreviewLang === "en" ? "Classic format ideal for printing, archiving, or job applications." : "Formato clássico ideal para impressão, arquivamento ou anexar em processos seletivos."}</p>
                      </div>
                      <span className="cv-option-arrow">↓</span>
                    </a>
                  </div>

                  <div className="cv-modal-footer">
                    <div className="cv-footer-hint">
                      Atualizado em: <strong>{cvUpdatedAt || "Recente"}</strong> • Dual-Mode Docs &amp; PDF ({cvPreviewLang.toUpperCase()})
                    </div>
                  </div>
                </div>
              </div>

              <div className="cv-preview-footer-note">
                <em>Você pode alternar os botões EN e PT acima para testar as duas versões exatamente como o visitante!</em>
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
                          <div className="drawing-card-thumb-placeholder"></div>
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
                        &times;
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
                Ver Galeria no Site ↗
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
                    Salvar Desenho
                  </button>
                </div>
              </div>

              {/* 2-Column Grid: Form + Live Preview */}
              <div className="drawings-workspace-grid">
                {/* Form Column */}
                <div className="drawings-form-card">
                  <div className="drawings-card-title">
                    Informações da Arte
                  </div>

                  <form onSubmit={handleSaveDrawing}>
                    <div className="drawings-form-group">
                      <label>
                        <strong>Título da Obra (EN &amp; PT) *</strong>
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: "#a78bfa", fontWeight: "600", display: "block", marginBottom: "4px" }}>EN (Inglês)</span>
                          <input
                            type="text"
                            className="drawings-input"
                            placeholder="Artwork title in English..."
                            value={drawingTitleEn}
                            onChange={(e) => {
                              setDrawingTitleEn(e.target.value);
                              setDrawingTitle(e.target.value);
                            }}
                            required
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "600", display: "block", marginBottom: "4px" }}>PT (Português)</span>
                          <input
                            type="text"
                            className="drawings-input"
                            placeholder="Título da obra em Português..."
                            value={drawingTitlePt}
                            onChange={(e) => {
                              setDrawingTitlePt(e.target.value);
                              if (!drawingTitleEn) setDrawingTitle(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="drawings-form-group">
                      <label>
                        <strong>Técnica / Detalhes - Legenda (EN &amp; PT)</strong>
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: "#a78bfa", fontWeight: "600", display: "block", marginBottom: "4px" }}>EN (Inglês)</span>
                          <input
                            type="text"
                            className="drawings-input"
                            placeholder="Technique / details in English..."
                            value={drawingDescriptionEn}
                            onChange={(e) => {
                              setDrawingDescriptionEn(e.target.value);
                              setDrawingDescription(e.target.value);
                            }}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "600", display: "block", marginBottom: "4px" }}>PT (Português)</span>
                          <input
                            type="text"
                            className="drawings-input"
                            placeholder="Técnica / detalhes em Português..."
                            value={drawingDescriptionPt}
                            onChange={(e) => {
                              setDrawingDescriptionPt(e.target.value);
                              if (!drawingDescriptionEn) setDrawingDescription(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <small className="drawings-hint">
                        Exibido como legenda ao abrir o desenho no modo ampliado (lightbox).
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
                            <span className="dropzone-icon"></span>
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
                          {drawingUploadFeedback.message}
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
                        Salvar Alterações
                      </button>
                      {selectedId && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDrawing(selectedId)}
                          className="btn-delete-drawing-danger"
                        >
                          Excluir Desenho
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Live Preview Column */}
                <div className="drawings-preview-card">
                  <div className="drawings-card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Prévia (/hobbies)</span>
                    <div style={{ display: "inline-flex", gap: "4px" }}>
                      <button
                        type="button"
                        style={{
                          background: activeEditorLang === "en" ? "#8b5cf6" : "#21262d",
                          color: "#fff",
                          border: "none",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                        onClick={() => setActiveEditorLang("en")}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        style={{
                          background: activeEditorLang === "pt" ? "#8b5cf6" : "#21262d",
                          color: "#fff",
                          border: "none",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                        onClick={() => setActiveEditorLang("pt")}
                      >
                        PT
                      </button>
                    </div>
                  </div>
                  <div className="drawings-preview-inner">
                    <p className="drawings-preview-explanation">
                      Exibição no site no idioma selecionado ({activeEditorLang.toUpperCase()}):
                    </p>

                    {/* Simulation of ArtGallery card */}
                    <div className="drawing-preview-masonry-card">
                      {drawingSrc ? (
                        <div className="art-item-simulation">
                          <img
                            src={drawingSrc}
                            alt={(activeEditorLang === "en" ? (drawingTitleEn || drawingTitle) : (drawingTitlePt || drawingTitle)) || "Sem título"}
                            className="preview-img-tag"
                          />
                          <div className="art-overlay-simulation">
                            <span>{(activeEditorLang === "en" ? (drawingTitleEn || drawingTitle) : (drawingTitlePt || drawingTitle)) || "Título da Obra"}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="preview-empty-image">
                          <span></span>
                          <p>Nenhuma imagem selecionada ainda.</p>
                          <small>Faça upload acima ou digite uma URL para visualizar a prévia.</small>
                        </div>
                      )}
                    </div>

                    {/* Simulation of Lightbox details */}
                    <div className="drawing-preview-lightbox-details">
                      <div className="preview-lightbox-header">
                        <span className="lightbox-badge">Prévia da Legenda ({activeEditorLang.toUpperCase()})</span>
                        <span className="lightbox-dimensions">
                          {drawingIsPublished ? "Visível no site" : "Rascunho privado"}
                        </span>
                      </div>
                      <h3 className="preview-lightbox-title">
                        {(activeEditorLang === "en" ? (drawingTitleEn || drawingTitle) : (drawingTitlePt || drawingTitle)) || "Título da Obra"}
                      </h3>
                      <p className="preview-lightbox-desc">
                        {(activeEditorLang === "en" ? (drawingDescriptionEn || drawingDescription) : (drawingDescriptionPt || drawingDescription)) || "Técnica e detalhes não informados."}
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
                          &times;
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
                Organizar Ordem dos Cards
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
                      {selectedId ? "Editar Experiência Profissional" : "Nova Experiência"}
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
                        Salvar Experiência
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#a78bfa" }}>
                        Cargo ou Formação em Inglês (EN):
                      </label>
                      <input
                        type="text"
                        style={{ width: "100%", fontSize: "15px", padding: "12px", borderRadius: "8px", background: "#0d1117", border: "1px solid #30363d", color: "#fff" }}
                        placeholder="Ex: IT Intern, Backend Developer, BTI Degree..."
                        value={titleEn}
                        onChange={(e) => {
                          setTitleEn(e.target.value);
                          setTitle(e.target.value);
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#38bdf8" }}>
                        Cargo ou Formação em Português (PT):
                      </label>
                      <input
                        type="text"
                        style={{ width: "100%", fontSize: "15px", padding: "12px", borderRadius: "8px", background: "#0d1117", border: "1px solid #30363d", color: "#fff" }}
                        placeholder="Ex: Estagiário de TI, Desenvolvedor Backend, Bacharelado em BTI..."
                        value={titlePt}
                        onChange={(e) => {
                          setTitlePt(e.target.value);
                          if (!titleEn) setTitle(e.target.value);
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px", marginBottom: "18px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#8b949e" }}>
                        Empresa / Órgão / Instituição:
                      </label>
                      <input
                        type="text"
                        style={{ width: "100%", fontSize: "14px", padding: "12px", borderRadius: "8px", background: "#0d1117", border: "1px solid #30363d", color: "#fff" }}
                        placeholder="Ex: Detran, Cachina Soluções, UFRN..."
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#a78bfa" }}>
                        Período em Inglês (EN):
                      </label>
                      <input
                        type="text"
                        style={{ width: "100%", fontSize: "14px", padding: "12px", borderRadius: "8px", background: "#0d1117", border: "1px solid #30363d", color: "#fff" }}
                        placeholder="Ex: June 2026 - Present"
                        value={timePeriodEn}
                        onChange={(e) => {
                          setTimePeriodEn(e.target.value);
                          setTimePeriod(e.target.value);
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#38bdf8" }}>
                        Período em Português (PT):
                      </label>
                      <input
                        type="text"
                        style={{ width: "100%", fontSize: "14px", padding: "12px", borderRadius: "8px", background: "#0d1117", border: "1px solid #30363d", color: "#fff" }}
                        placeholder="Ex: Junho 2026 - Presente"
                        value={timePeriodPt}
                        onChange={(e) => {
                          setTimePeriodPt(e.target.value);
                          if (!timePeriodEn) setTimePeriod(e.target.value);
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#a78bfa" }}>
                        Atividades &amp; Conquistas em Inglês (EN, 1 por linha):
                      </label>
                      <textarea
                        rows="6"
                        style={{ width: "100%", fontSize: "13px", padding: "14px", borderRadius: "8px", background: "#0d1117", border: "1px solid #30363d", color: "#fff", lineHeight: "1.6", resize: "vertical" }}
                        placeholder="Ex:&#10;Backend system engineering in Python&#10;Workflow automations with n8n..."
                        value={bulletsTextEn}
                        onChange={(e) => {
                          setBulletsTextEn(e.target.value);
                          setBulletsText(e.target.value);
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#38bdf8" }}>
                        Atividades &amp; Conquistas em Português (PT, 1 por linha):
                      </label>
                      <textarea
                        rows="6"
                        style={{ width: "100%", fontSize: "13px", padding: "14px", borderRadius: "8px", background: "#0d1117", border: "1px solid #30363d", color: "#fff", lineHeight: "1.6", resize: "vertical" }}
                        placeholder="Ex:&#10;Engenharia de sistemas de backend em Python&#10;Automações de fluxos de trabalho com n8n..."
                        value={bulletsTextPt}
                        onChange={(e) => {
                          setBulletsTextPt(e.target.value);
                          if (!bulletsTextEn) setBulletsText(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <small style={{ color: "#8b949e", fontSize: "12px", display: "block" }}>
                    Cada linha quebrada será renderizada como um ponto na lista de experiência do portfólio no idioma correspondente.
                  </small>
                </div>

                {/* Live Preview Card */}
                <div style={{ background: "#0d1117", border: "1px solid rgba(139, 92, 246, 0.4)", borderRadius: "12px", padding: "24px", boxShadow: "0 8px 30px rgba(139, 92, 246, 0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ color: "#a78bfa", fontWeight: "700", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
                      Prévia Idêntica ao Site Oficial
                    </span>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        type="button"
                        style={{
                          background: expPreviewLang === "en" ? "#8b5cf6" : "#21262d",
                          color: "#fff",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                        onClick={() => setExpPreviewLang("en")}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        style={{
                          background: expPreviewLang === "pt" ? "#8b5cf6" : "#21262d",
                          color: "#fff",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                        onClick={() => setExpPreviewLang("pt")}
                      >
                        PT
                      </button>
                    </div>
                  </div>

                  <div className="exp-display-card">
                    <div className="exp-card-body">
                      <h3>
                        {(expPreviewLang === "en" ? (titleEn || title) : (titlePt || title)) || "Cargo ou Título"} |{" "}
                        <span className="company-highlight">{company || "Empresa"}</span>
                      </h3>
                      <p className="exp-timeline">
                        {(expPreviewLang === "en" ? (timePeriodEn || timePeriod) : (timePeriodPt || timePeriod)) || "Período / Ano"}
                      </p>
                      <div className="card-inner-divider"></div>
                      <ul className="exp-bullet-list">
                        {((expPreviewLang === "en" ? (bulletsTextEn || bulletsText) : (bulletsTextPt || bulletsText))
                          .split("\n")
                          .map((b) => b.trim())
                          .filter(Boolean).length > 0
                          ? (expPreviewLang === "en" ? (bulletsTextEn || bulletsText) : (bulletsTextPt || bulletsText))
                              .split("\n")
                              .map((b) => b.trim())
                              .filter(Boolean)
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

                <div className="admin-lang-toggle-bar">
                  <button
                    type="button"
                    className={`admin-lang-btn ${activeEditorLang === "en" ? "active" : ""}`}
                    onClick={() => setActiveEditorLang("en")}
                    title="Editar textos em Inglês (EN)"
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    className={`admin-lang-btn ${activeEditorLang === "pt" ? "active" : ""}`}
                    onClick={() => setActiveEditorLang("pt")}
                    title="Editar textos em Português (PT)"
                  >
                    PT
                  </button>
                </div>

                <input
                  type="text"
                  className="document-title-input"
                  placeholder={
                    activeEditorLang === "en"
                      ? "Title in English (EN)..."
                      : "Título em Português (PT)..."
                  }
                  value={activeEditorLang === "en" ? titleEn : titlePt}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (activeEditorLang === "en") {
                      setTitleEn(val);
                      setTitle(val);
                    } else {
                      setTitlePt(val);
                      if (!titleEn) setTitle(val);
                    }
                  }}
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
                      {relatedArticleId ? `Artigo Anexo: ${getStoredArticles().find((a) => a.id === relatedArticleId)?.title.slice(0, 16) || "Vinculado"}...` : "Anexar Artigo"}
                    </button>
                  )}

                  {activeTab === "articles" && (
                    <button
                      type="button"
                      className={`btn-attach-relation ${relatedProjectId ? "is-linked" : ""}`}
                      onClick={() => setShowRelationModal(true)}
                      title="Clique para anexar um projeto prático a este artigo"
                    >
                      {relatedProjectId ? `Projeto Anexo: ${getStoredProjects().find((p) => p.id === relatedProjectId)?.title.slice(0, 16) || "Vinculado"}...` : "Anexar Projeto"}
                    </button>
                  )}

                  <button
                    type="button"
                    className={`btn-toggle-meta ${isMetaOpen ? "active" : ""}`}
                    onClick={() => setIsMetaOpen(!isMetaOpen)}
                    title="Configurar Categoria, Tags, Links, Google Docs/PDF e Sinopse"
                  >
                    Propriedades {isMetaOpen ? "▲" : "▼"}
                  </button>

                  <div className="template-picker">
                    <select
                      value={selectedTemplate}
                      onChange={(e) => {
                        setSelectedTemplate(e.target.value);
                        if (e.target.value) handleApplyTemplate(e.target.value);
                      }}
                    >
                      <option value="">Modelos...</option>
                      {DOCUMENT_TEMPLATES.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button className="btn-save-document" onClick={handleSaveItem}>
                    Salvar
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
                        Markdown & README
                      </button>
                      <button
                        type="button"
                        className={`source-btn ${contentType === "google-docs" ? "active" : ""}`}
                        onClick={() => setContentType("google-docs")}
                      >
                        Google Docs Integrado
                      </button>
                      <button
                        type="button"
                        className={`source-btn ${contentType === "pdf" ? "active" : ""}`}
                        onClick={() => setContentType("pdf")}
                      >
                        Documento PDF
                      </button>
                    </div>

                    {contentType === "google-docs" && (
                      <span className="source-hint">
                        Artigos editados no Google Docs atualizam automaticamente no site!
                      </span>
                    )}
                  </div>

                  {contentType === "google-docs" && (
                    <div className="external-source-card gdocs-source-card">
                      <div className="source-card-header">
                        <strong>Link do Google Docs</strong>
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
                        <strong>Documento PDF (URL ou Arquivo)</strong>
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
                      <label>Anexar Artigo Técnico ao Projeto:</label>
                      <div className="attachment-select-wrap">
                        <select
                          value={relatedArticleId}
                          onChange={(e) => setRelatedArticleId(e.target.value)}
                          className="meta-relation-select"
                        >
                          <option value="">Nenhum artigo vinculado</option>
                          {getStoredArticles().map((art) => (
                            <option key={art.id} value={art.id}>
                              {art.title}
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
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "articles" && (
                    <div className="meta-attachment-row">
                      <label>Anexar Projeto Prático ao Artigo:</label>
                      <div className="attachment-select-wrap">
                        <select
                          value={relatedProjectId}
                          onChange={(e) => setRelatedProjectId(e.target.value)}
                          className="meta-relation-select"
                        >
                          <option value="">Nenhum projeto vinculado</option>
                          {getStoredProjects().map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title}
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
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="meta-bilingual-card">
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Textos Bilíngues (EN &amp; PT)</span>
                      <span style={{ fontSize: "11px", color: "#8b949e", textTransform: "none", fontWeight: "normal" }}>Defina as versões para cada idioma</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#a78bfa", marginBottom: "6px" }}>
                          Título em Inglês (EN):
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: AgentMetrics: Autonomous AI Agent Telemetry"
                          value={titleEn}
                          onChange={(e) => {
                            setTitleEn(e.target.value);
                            setTitle(e.target.value);
                          }}
                          style={{ width: "100%", padding: "8px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: "6px", color: "#fff", fontSize: "13px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#38bdf8", marginBottom: "6px" }}>
                          Título em Português (PT):
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: AgentMetrics: Telemetria de Agentes Autônomos de IA"
                          value={titlePt}
                          onChange={(e) => {
                            setTitlePt(e.target.value);
                            if (!titleEn) setTitle(e.target.value);
                          }}
                          style={{ width: "100%", padding: "8px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: "6px", color: "#fff", fontSize: "13px" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#a78bfa", marginBottom: "6px" }}>
                          Sinopse / Contexto IA em Inglês (EN):
                        </label>
                        <textarea
                          rows="3"
                          placeholder="Short description displayed when site is in English..."
                          value={shortDescriptionEn}
                          onChange={(e) => {
                            setShortDescriptionEn(e.target.value);
                            setShortDescription(e.target.value);
                          }}
                          style={{ width: "100%", padding: "8px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: "6px", color: "#fff", fontSize: "13px", resize: "vertical" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#38bdf8", marginBottom: "6px" }}>
                          Sinopse / Contexto IA em Português (PT):
                        </label>
                        <textarea
                          rows="3"
                          placeholder="Breve resumo objetivo exibido quando o site estiver em Português..."
                          value={shortDescriptionPt}
                          onChange={(e) => {
                            setShortDescriptionPt(e.target.value);
                            if (!shortDescriptionEn) setShortDescription(e.target.value);
                          }}
                          style={{ width: "100%", padding: "8px 12px", background: "#0d1117", border: "1px solid #30363d", borderRadius: "6px", color: "#fff", fontSize: "13px", resize: "vertical" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Editor Language Selector Bar */}
            <div className="editor-lang-indicator-bar">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#8b949e", fontWeight: "600" }}>Idioma do Conteúdo:</span>
                <div className="admin-lang-toggle-bar" style={{ margin: 0 }}>
                  <button
                    type="button"
                    className={`admin-lang-btn ${activeEditorLang === "en" ? "active" : ""}`}
                    onClick={() => setActiveEditorLang("en")}
                  >
                    Inglês (EN)
                  </button>
                  <button
                    type="button"
                    className={`admin-lang-btn ${activeEditorLang === "pt" ? "active" : ""}`}
                    onClick={() => setActiveEditorLang("pt")}
                  >
                    Português (PT)
                  </button>
                </div>
                <span style={{ color: activeEditorLang === "en" ? "#a78bfa" : "#38bdf8", fontSize: "12px", fontWeight: "500" }}>
                  {activeEditorLang === "en"
                    ? "Editando texto que será exibido aos visitantes em English"
                    : "Editando texto que será exibido aos visitantes em Português"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (activeEditorLang === "en") {
                    if (!markdownContentPt) {
                      showToast("A versão em Português está vazia.");
                      return;
                    }
                    if (markdownContentEn && !window.confirm("Substituir o conteúdo atual em Inglês pelo conteúdo em Português?")) return;
                    setMarkdownContentEn(markdownContentPt);
                    setMarkdownContent(markdownContentPt);
                    showToast("Conteúdo copiado de Português para Inglês!");
                  } else {
                    if (!markdownContentEn) {
                      showToast("A versão em Inglês está vazia.");
                      return;
                    }
                    if (markdownContentPt && !window.confirm("Substituir o conteúdo atual em Português pelo conteúdo em Inglês?")) return;
                    setMarkdownContentPt(markdownContentEn);
                    showToast("Conteúdo copiado de Inglês para Português!");
                  }
                }}
                style={{
                  background: "#161b22",
                  border: "1px solid #30363d",
                  color: "#c9d1d9",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  cursor: "pointer"
                }}
                title="Copiar texto do outro idioma como base para tradução"
              >
                Copiar do outro idioma
              </button>
            </div>

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
                  Tarefa
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
                  Citação
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Código"
                  onClick={() => applyToolbarFormat("code-block")}
                >
                  Código
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Tabela"
                  onClick={() => applyToolbarFormat("table")}
                >
                  Tabela
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
                  Link
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  title="Imagem"
                  onClick={() => applyToolbarFormat("image")}
                >
                  Imagem
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
                  Editor
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === "split" ? "active" : ""}`}
                  onClick={() => setViewMode("split")}
                  title="Visualização Dividida"
                >
                  Dividido
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === "preview" ? "active" : ""}`}
                  onClick={() => setViewMode("preview")}
                  title="Prévia Formatada"
                >
                  Prévia
                </button>
                <button
                  type="button"
                  className="shortcuts-help-btn"
                  onClick={() => setShowShortcutsModal(true)}
                  title="Atalhos"
                >
                  Atalhos
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
                    value={activeEditorLang === "en" ? markdownContentEn : markdownContentPt}
                    onChange={(e) => updateCurrentMarkdown(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      activeEditorLang === "en"
                        ? "Write in Markdown (EN) or use keyboard shortcuts..."
                        : "Escreva em Markdown (PT) ou utilize os atalhos de teclado..."
                    }
                    spellCheck="false"
                  ></textarea>
                </div>
              )}

              {viewMode !== "editor" && (
                <div className="editor-preview-pane">
                  {contentType === "google-docs" && embedGoogleDocsUrl ? (
                    <div className="gdocs-live-frame-container">
                      <div className="live-frame-header">
                        <span>Pré-visualização do Google Docs:</span>
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
                        <span>Pré-visualização do PDF:</span>
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
                      <div className="preview-label-tag">
                        Live Preview ({activeEditorLang === "en" ? "EN - English" : "PT - Português"})
                      </div>
                      <SimpleMarkdownRenderer
                        content={
                          activeEditorLang === "en"
                            ? (markdownContentEn || markdownContent)
                            : (markdownContentPt || markdownContent)
                        }
                      />
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
              <h3>Atalhos de Teclado (Obsidian & Word Style)</h3>
              <button type="button" className="btn-close-modal" onClick={() => setShowShortcutsModal(false)}>&times;</button>
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
                  ? `Anexar Artigo Técnico ao Projeto: "${title}"`
                  : `Anexar Projeto Prático ao Artigo: "${title}"`}
              </h3>
              <button type="button" className="btn-close-modal" onClick={() => setShowRelationModal(false)}>&times;</button>
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
                      <strong>Nenhum artigo anexado</strong>
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
                        <strong>{art.title}</strong>
                        <span>{art.shortDescription || art.aboutContext || "Sem descrição"}</span>
                      </div>
                      {relatedArticleId === art.id ? (
                        <span className="relation-active-tag">Vinculado</span>
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
                      <strong>Nenhum projeto anexado</strong>
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
                        <strong>{p.title}</strong>
                        <span>{p.shortDescription || p.aboutContext || "Sem descrição"}</span>
                      </div>
                      {relatedProjectId === p.id ? (
                        <span className="relation-active-tag">Vinculado</span>
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
