// src/components/BlogReaderDock.jsx
// Interactive Reader Dock (Ferramentas de Leitura: Marca-texto, Bloco de Notas, Impressão, Gatilhos de IA e Tipografia)

import { useState, useEffect, useRef, useCallback } from "react";
import "./BlogReaderDock.css";

export default function BlogReaderDock({
  activePost,
  isTech = true,
  fontScale = 1,
  setFontScale,
  zenMode = false,
  setZenMode,
  onBackToFeed,
  prevPost = null,
  nextPost = null,
  onSelectPost
}) {
  const [isHighlighterOn, setIsHighlighterOn] = useState(false);
  const [highlightCount, setHighlightCount] = useState(0);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState(() => {
    try {
      return sessionStorage.getItem(`blog_notes_${activePost?.id}`) || "";
    } catch {
      return "";
    }
  });
  const [toastMessage, setToastMessage] = useState("");

  const dockRef = useRef(null);

  // Show transient feedback message
  const triggerToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2800);
  }, []);

  // Sync notes to sessionStorage during this browser session
  useEffect(() => {
    try {
      if (activePost?.id) {
        sessionStorage.setItem(`blog_notes_${activePost.id}`, sessionNotes);
      }
    } catch {
      // Ignore in private modes
    }
  }, [sessionNotes, activePost?.id]);

  // Handle Text Selection for Highlighter
  useEffect(() => {
    if (!isHighlighterOn) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) return;

      const selectedText = selection.toString().trim();
      if (selectedText.length < 2) return;

      const range = selection.getRangeAt(0);
      const articleEl = document.querySelector(".blog-reader-view");
      if (!articleEl || !articleEl.contains(range.commonAncestorContainer)) return;

      try {
        const mark = document.createElement("mark");
        mark.className = `reader-live-highlight ${isTech ? "tech" : "alomyr"}`;
        mark.title = "Clique para remover este destaque";
        mark.onclick = (e) => {
          e.stopPropagation();
          const parent = mark.parentNode;
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark);
          }
          parent.removeChild(mark);
          setHighlightCount((c) => Math.max(0, c - 1));
          triggerToast("Destaque removido.");
        };

        range.surroundContents(mark);
        selection.removeAllRanges();
        setHighlightCount((c) => c + 1);
        triggerToast("Trecho destacado!");
      } catch {
        // Selection crossed complex nodes; fallback silently
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [isHighlighterOn, isTech, triggerToast]);

  // Clear all highlights in current article
  const handleClearHighlights = () => {
    const marks = document.querySelectorAll(".reader-live-highlight");
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
    });
    setHighlightCount(0);
    triggerToast("Todas as marcações foram limpas.");
  };

  // Print Article in Magazine Paper Format
  const handlePrint = () => {
    window.print();
  };

  // Font scale cycle: 0.9 -> 1.0 -> 1.15 -> 1.3 -> 0.9
  const handleCycleFont = () => {
    if (!setFontScale) return;
    const scales = [0.9, 1.0, 1.15, 1.3];
    const currentIndex = scales.findIndex((s) => Math.abs(s - fontScale) < 0.05);
    const nextIndex = (currentIndex + 1) % scales.length;
    setFontScale(scales[nextIndex]);
    triggerToast(`Tamanho da fonte: ${Math.round(scales[nextIndex] * 100)}%`);
  };

  // Trigger Alomyr Assistant with pre-formatted prompts
  const triggerAiAssistant = (promptText) => {
    setIsAiMenuOpen(false);
    window.dispatchEvent(
      new CustomEvent("open-alomyr-chat", {
        detail: {
          prompt: promptText
        }
      })
    );
  };

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        setIsNotesOpen(false);
        setIsAiMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const postTitle = activePost?.titlePt || activePost?.titleEn || "este artigo";

  return (
    <aside className="blog-reader-dock-container" ref={dockRef} aria-label="Ferramentas de Leitura">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="dock-toast-pill" role="status">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Popover: Caderno de Notas de Margem (Sessão Atual) */}
      {isNotesOpen && (
        <div className="dock-notes-popover">
          <div className="dock-notes-header">
            <div className="dock-notes-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <span>Anotações da Sessão</span>
            </div>
            <button
              type="button"
              className="dock-notes-close"
              onClick={() => setIsNotesOpen(false)}
              aria-label="Fechar anotações"
            >
              ✕
            </button>
          </div>
          <p className="dock-notes-hint">
            Suas anotações ficam ativas durante esta navegação e expiram ao fechar.
          </p>
          <textarea
            className="dock-notes-textarea"
            placeholder="Anote reflexões, citações ou ideias enquanto lê este artigo..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            rows={5}
          />
          <div className="dock-notes-footer">
            <span className="dock-notes-counter">{sessionNotes.length} caracteres</span>
            {sessionNotes && (
              <button
                type="button"
                className="dock-notes-clear-btn"
                onClick={() => {
                  setSessionNotes("");
                  triggerToast("Anotações limpas.");
                }}
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Popover: Gatilhos do Agente de IA */}
      {isAiMenuOpen && (
        <div className="dock-ai-popover">
          <div className="dock-ai-header">
            <div className="dock-ai-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Consultar Assistente Alomyr</span>
            </div>
            <button
              type="button"
              className="dock-ai-close"
              onClick={() => setIsAiMenuOpen(false)}
              aria-label="Fechar menu IA"
            >
              ✕
            </button>
          </div>
          <div className="dock-ai-options">
            <button
              type="button"
              className="dock-ai-option-btn"
              onClick={() =>
                triggerAiAssistant(
                  `Por favor, elabore um resumo conciso com os 3 principais insights do artigo "${postTitle}".`
                )
              }
            >
              <span className="option-title">Resumo em 3 Pontos</span>
              <span className="option-desc">Extrai os tópicos centrais e lições práticas</span>
            </button>

            <button
              type="button"
              className="dock-ai-option-btn"
              onClick={() =>
                triggerAiAssistant(
                  `Poderia explicar os conceitos técnicos do artigo "${postTitle}" de forma simples e didática para um iniciante?`
                )
              }
            >
              <span className="option-title">Explicar para Iniciante</span>
              <span className="option-desc">Conceitos técnicos mastigados sem jargões</span>
            </button>

            <button
              type="button"
              className="dock-ai-option-btn"
              onClick={() =>
                triggerAiAssistant(
                  `Quais são as limitações, desafios reais e melhores práticas associadas ao tema discutido em "${postTitle}"?`
                )
              }
            >
              <span className="option-title">Análise Crítica & Desafios</span>
              <span className="option-desc">Perspectiva prática de engenharia e produção</span>
            </button>

            <button
              type="button"
              className="dock-ai-option-btn"
              onClick={() =>
                triggerAiAssistant(
                  `Gostaria de fazer uma pergunta sobre o artigo "${postTitle}": `
                )
              }
            >
              <span className="option-title">Fazer Pergunta Personalizada</span>
              <span className="option-desc">Abrir diálogo livre no contexto do post</span>
            </button>
          </div>
        </div>
      )}

      {/* Barra Flutuante Estilo Dock */}
      <nav className={`reader-dock-pill ${isHighlighterOn ? "highlighter-engaged" : ""}`}>
        {/* Marca-Texto Tool */}
        <div className="dock-tool-group">
          <button
            type="button"
            className={`dock-action-btn ${isHighlighterOn ? "active" : ""}`}
            onClick={() => {
              const nextState = !isHighlighterOn;
              setIsHighlighterOn(nextState);
              triggerToast(
                nextState
                  ? "Marca-texto ativo: selecione qualquer frase no texto para destacar!"
                  : "Marca-texto desativado."
              );
            }}
            title={isHighlighterOn ? "Desativar Marca-texto" : "Ativar Marca-texto (destacar trechos)"}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span className="dock-btn-label">Marca-texto</span>
            {highlightCount > 0 && <span className="dock-badge">{highlightCount}</span>}
          </button>

          {highlightCount > 0 && (
            <button
              type="button"
              className="dock-mini-clear-btn"
              onClick={handleClearHighlights}
              title="Limpar todos os destaques do artigo"
            >
              ✕
            </button>
          )}
        </div>

        <div className="dock-divider"></div>

        {/* Anotações de Margem */}
        <button
          type="button"
          className={`dock-action-btn ${isNotesOpen ? "active" : ""} ${sessionNotes ? "has-content" : ""}`}
          onClick={() => {
            setIsNotesOpen(!isNotesOpen);
            setIsAiMenuOpen(false);
          }}
          title="Caderno de anotações temporárias da leitura"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span className="dock-btn-label">Anotações</span>
          {sessionNotes && <span className="dock-dot-indicator"></span>}
        </button>

        {/* Gatilhos do Agente IA */}
        <button
          type="button"
          className={`dock-action-btn dock-ai-btn ${isAiMenuOpen ? "active" : ""}`}
          onClick={() => {
            setIsAiMenuOpen(!isAiMenuOpen);
            setIsNotesOpen(false);
          }}
          title="Pedir resumo ou tirar dúvidas com o Assistente Alomyr"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span className="dock-btn-label">Perguntar à IA</span>
        </button>

        <div className="dock-divider"></div>

        {/* Tamanho da Fonte */}
        <button
          type="button"
          className="dock-action-btn"
          onClick={handleCycleFont}
          title="Ajustar tamanho da fonte do artigo"
        >
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Aa</span>
          <span className="dock-btn-label">{Math.round(fontScale * 100)}%</span>
        </button>

        {/* Modo Zen / Foco */}
        {setZenMode && (
          <button
            type="button"
            className={`dock-action-btn ${zenMode ? "active" : ""}`}
            onClick={() => {
              const next = !zenMode;
              setZenMode(next);
              triggerToast(next ? "Modo Zen ativado: foco total na leitura." : "Modo Zen desativado.");
            }}
            title={zenMode ? "Sair do Modo Foco Zen" : "Ativar Modo Foco Zen (esconder distrações)"}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span className="dock-btn-label">Foco Zen</span>
          </button>
        )}

        {/* Botão de Imprimir Revista */}
        <button
          type="button"
          className="dock-action-btn"
          onClick={handlePrint}
          title="Imprimir ou Salvar Artigo em PDF (Formato Revista Limpa)"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          <span className="dock-btn-label">Imprimir</span>
        </button>

        {/* Navegação Entre Artigos */}
        {(prevPost || nextPost) && (
          <>
            <div className="dock-divider"></div>
            {prevPost && (
              <button
                type="button"
                className="dock-action-btn nav-arrow"
                onClick={() => onSelectPost && onSelectPost(prevPost)}
                title={`Artigo Anterior: ${prevPost.titlePt || prevPost.titleEn}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}
            {nextPost && (
              <button
                type="button"
                className="dock-action-btn nav-arrow"
                onClick={() => onSelectPost && onSelectPost(nextPost)}
                title={`Próximo Artigo: ${nextPost.titlePt || nextPost.titleEn}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
          </>
        )}

        {/* Voltar ao Feed */}
        {onBackToFeed && (
          <>
            <div className="dock-divider"></div>
            <button
              type="button"
              className="dock-action-btn dock-back-feed"
              onClick={onBackToFeed}
              title="Fechar leitura e retornar ao Feed do Blog"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </>
        )}
      </nav>
    </aside>
  );
}
