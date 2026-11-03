import { useState, useEffect } from "react";
import {
  getStoredProjects,
  resetProjectsToDefault,
  getStoredArticles,
  getStoredThoughts
} from "../data/projectsData";
import {
  fetchWorks,
  fetchArticles,
  fetchThoughts,
  persistBatchOrder
} from "../lib/supabaseService";
import "./OrderDraft.css";

const CATEGORIES = [
  {
    id: "Profissional",
    label: "Profissional & Corporativo",
    icon: "🏢",
    badgeClass: "cat-profissional",
    description: "Projetos desenvolvidos para empresas, clientes corporativos e soluções de produção em larga escala."
  },
  {
    id: "Pessoal",
    label: "Projetos Pessoais & Inovações",
    icon: "🚀",
    badgeClass: "cat-pessoal",
    description: "Projetos autorais, ferramentas de produtividade, suítes de design e extensões públicas."
  },
  {
    id: "Acadêmico",
    label: "Acadêmico & Pesquisa Científica",
    icon: "🎓",
    badgeClass: "cat-academico",
    description: "Pesquisas na UFRN/IFRN, experimentos de Machine Learning, Deep Learning, Visão Computacional e algoritmos complexos."
  }
];

export default function OrderDraft({ onBackToHome, onOpenProjectDetail, onNavigateToAdmin }) {
  const [activeTab, setActiveTab] = useState("projects"); // 'projects' | 'articles' | 'thoughts'
  const [items, setItems] = useState(() => getStoredProjects());
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);
  const [dragOverTargetId, setDragOverTargetId] = useState(null);
  const [notification, setNotification] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  // Switch tab and load corresponding items
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "projects") {
      setItems(getStoredProjects());
    } else if (tab === "articles") {
      setItems(getStoredArticles());
    } else {
      setItems(getStoredThoughts());
    }
  };

  useEffect(() => {
    if (activeTab === "projects") {
      fetchWorks(true).then((data) => {
        if (data && data.length > 0) setItems(data);
      });
    } else if (activeTab === "articles") {
      fetchArticles(true).then((data) => {
        if (data && data.length > 0) setItems(data);
      });
    } else {
      fetchThoughts(true).then((data) => {
        if (data && data.length > 0) setItems(data);
      });
    }
  }, [activeTab]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification("");
    }, 4000);
  };

  // Reorder items within a specific category
  const moveItemWithinCategory = (category, itemIndexInCat, delta) => {
    const catItems = items.filter((i) => (i.category || "Profissional") === category);
    const targetCatIndex = itemIndexInCat + delta;

    if (targetCatIndex < 0 || targetCatIndex >= catItems.length) return;

    const itemToMove = catItems[itemIndexInCat];
    const itemTarget = catItems[targetCatIndex];

    const newItems = [...items];
    const globalIdxA = newItems.findIndex((i) => i.id === itemToMove.id);
    const globalIdxB = newItems.findIndex((i) => i.id === itemTarget.id);

    // Swap elements in the global array
    const temp = newItems[globalIdxA];
    newItems[globalIdxA] = newItems[globalIdxB];
    newItems[globalIdxB] = temp;

    setItems(newItems);
  };

  // Move item to top of its category
  const moveToTopCategory = (category, itemIndexInCat) => {
    if (itemIndexInCat === 0) return;
    const catItems = items.filter((i) => (i.category || "Profissional") === category);
    const itemToMove = catItems[itemIndexInCat];
    const firstItemInCat = catItems[0];

    const newItems = [...items];
    const oldIdx = newItems.findIndex((i) => i.id === itemToMove.id);
    const targetIdx = newItems.findIndex((i) => i.id === firstItemInCat.id);

    const [moved] = newItems.splice(oldIdx, 1);
    newItems.splice(targetIdx, 0, moved);
    setItems(newItems);
  };

  // Move item to bottom of its category
  const moveToBottomCategory = (category, itemIndexInCat) => {
    const catItems = items.filter((i) => (i.category || "Profissional") === category);
    if (itemIndexInCat === catItems.length - 1) return;
    const itemToMove = catItems[itemIndexInCat];
    const lastItemInCat = catItems[catItems.length - 1];

    const newItems = [...items];
    const oldIdx = newItems.findIndex((i) => i.id === itemToMove.id);
    const targetIdx = newItems.findIndex((i) => i.id === lastItemInCat.id);

    const [moved] = newItems.splice(oldIdx, 1);
    newItems.splice(targetIdx, 0, moved);
    setItems(newItems);
  };

  // Move item to another category
  const changeItemCategory = (itemId, newCategory) => {
    const newItems = items.map((it) => {
      if (it.id === itemId) {
        return { ...it, category: newCategory };
      }
      return it;
    });
    setItems(newItems);
    showNotification(`Item movido para a sessão ${newCategory}!`);
  };

  // Drag and Drop
  const handleDragStart = (e, itemId) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
  };

  const handleDragOverCard = (e, targetId, category) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCategory(category);
    setDragOverTargetId(targetId);
  };

  const handleDragOverSection = (e, category) => {
    e.preventDefault();
    setDragOverCategory(category);
  };

  const handleDropOnSection = (e, targetCategory) => {
    e.preventDefault();
    if (!draggedItemId) return;

    const newItems = [...items];
    const draggedIdx = newItems.findIndex((i) => i.id === draggedItemId);
    if (draggedIdx === -1) return;

    const [draggedItem] = newItems.splice(draggedIdx, 1);
    draggedItem.category = targetCategory;

    if (dragOverTargetId && dragOverTargetId !== draggedItemId) {
      const targetIdx = newItems.findIndex((i) => i.id === dragOverTargetId);
      newItems.splice(targetIdx >= 0 ? targetIdx : newItems.length, 0, draggedItem);
    } else {
      // Find the last item of this category and append after it
      const lastCatIdx = newItems.map((it) => it.category).lastIndexOf(targetCategory);
      if (lastCatIdx >= 0) {
        newItems.splice(lastCatIdx + 1, 0, draggedItem);
      } else {
        newItems.push(draggedItem);
      }
    }

    setItems(newItems);
    setDraggedItemId(null);
    setDragOverCategory(null);
    setDragOverTargetId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverCategory(null);
    setDragOverTargetId(null);
  };

  // Save current order
  const handlePublishOrder = async () => {
    const res = await persistBatchOrder(activeTab, items);
    const msg = res.cloud
      ? "🚀 Nova ordem sincronizada no Supabase e publicada com sucesso!"
      : "💾 Nova ordem salva localmente (offline)!";
    showNotification(msg);
  };

  // Reset to default
  const handleResetOrder = () => {
    if (window.confirm("Deseja restaurar a ordenação padrão original das sessões?")) {
      if (activeTab === "projects") {
        const def = resetProjectsToDefault();
        setItems([...def]);
      } else {
        localStorage.removeItem(`portfolio_${activeTab}_data_v1`);
        if (activeTab === "articles") setItems(getStoredArticles());
        if (activeTab === "thoughts") setItems(getStoredThoughts());
      }
      showNotification("Ordem restaurada para os padrões originais.");
    }
  };

  return (
    <div className="order-cards-layout">
      {/* Toast Notification */}
      {notification && (
        <div className="order-toast-notification">
          <span>{notification}</span>
        </div>
      )}

      {/* Header Bar - Integrated with system */}
      <nav className="order-top-bar">
        <div className="order-brand">
          <div className="order-logo-badge">✦</div>
          <div>
            <h1>Organizador de Vitrine por Tipo</h1>
            <p className="order-subtitle">
              Sessões separadas: Pessoal, Profissional e Acadêmico em cards idênticos ao site
            </p>
          </div>
        </div>

        <div className="order-top-actions">
          <button
            type="button"
            className="editor-nav-btn"
            onClick={() => {
              if (onNavigateToAdmin) onNavigateToAdmin();
              else window.location.href = "/4dm1n";
            }}
            title="Ir para o editor de conteúdo e assistente IA"
          >
            ✍️ Editor & Agente
          </button>
          <button
            type="button"
            className={`preview-toggle-btn ${previewMode ? "active" : ""}`}
            onClick={() => setPreviewMode(!previewMode)}
            title="Alternar entre modo de edição e visualização final sem controles"
          >
            {previewMode ? "✏️ Modo Organização" : "👁️ Modo Vitrine Final"}
          </button>
          <button className="reset-order-btn" onClick={handleResetOrder}>
            ↺ Restaurar Padrão
          </button>
          <button className="publish-order-btn" onClick={handlePublishOrder}>
            🚀 Publicar Nova Ordem
          </button>
          <button className="exit-order-btn" onClick={onBackToHome}>
            ← Voltar ao Portfólio
          </button>
        </div>
      </nav>

      {/* Navigation & Search Bar */}
      <div className="order-controls-bar">
        <div className="order-tabs">
          <button
            className={`order-tab-btn ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => handleTabChange("projects")}
          >
            <span>💻</span> Projetos ({items.length})
          </button>
          <button
            className={`order-tab-btn ${activeTab === "articles" ? "active" : ""}`}
            onClick={() => handleTabChange("articles")}
          >
            <span>📑</span> Artigos Técnicos
          </button>
          <button
            className={`order-tab-btn ${activeTab === "thoughts" ? "active" : ""}`}
            onClick={() => handleTabChange("thoughts")}
          >
            <span>💭</span> Pensamentos & Insights
          </button>
        </div>

        <div className="order-search-box">
          <input
            type="text"
            placeholder="Filtrar por nome, tag ou palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        {/* Quick Jump anchors to the 3 sections */}
        <div className="section-jump-nav">
          <span className="jump-label">Saltar para sessão:</span>
          {CATEGORIES.map((cat) => (
            <a key={cat.id} href={`#session-${cat.id}`} className="jump-link">
              {cat.icon} {cat.id}
            </a>
          ))}
        </div>
      </div>

      {/* Guide Banner */}
      {!previewMode && (
        <div className="order-hint-banner">
          <div className="hint-icon">💡</div>
          <div className="hint-text">
            <strong>Organização Separada por Sessões:</strong> Os itens estão agora
            agrupados nas 3 sessões (<strong>Profissional</strong>, <strong>Pessoal</strong> e <strong>Acadêmico</strong>).
            Você pode definir a ordem interna de cada sessão com as setas ou arrastar livremente cards entre categorias!
          </div>
        </div>
      )}

      {/* Main Container with 3 Separated Category Sections */}
      <main className="order-cards-container">
        {CATEGORIES.map((category) => {
          const categoryItems = items
            .filter((item) => (item.category || "Profissional") === category.id)
            .filter((item) => {
              if (!searchQuery) return true;
              const q = searchQuery.toLowerCase();
              return (
                item.title.toLowerCase().includes(q) ||
                (item.shortDescription && item.shortDescription.toLowerCase().includes(q)) ||
                (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
              );
            });

          const isSectionDragOver = dragOverCategory === category.id;

          return (
            <section
              key={category.id}
              id={`session-${category.id}`}
              className={`category-session-block ${isSectionDragOver ? "section-drag-active" : ""}`}
              onDragOver={(e) => handleDragOverSection(e, category.id)}
              onDrop={(e) => handleDropOnSection(e, category.id)}
            >
              {/* Session Header */}
              <div className="session-header-bar">
                <div className="session-title-group">
                  <span className="session-icon">{category.icon}</span>
                  <div>
                    <h2 className="session-title">
                      Sessão: <span>{category.label}</span>
                    </h2>
                    <p className="session-desc">{category.description}</p>
                  </div>
                </div>

                <div className="session-count-badge">
                  <span>{categoryItems.length} {categoryItems.length === 1 ? "item" : "itens"}</span>
                </div>
              </div>

              {/* Grid of Cards within this Category Session */}
              <div className="order-cards-grid">
                {categoryItems.map((item, catIdx) => {
                  const isDragging = draggedItemId === item.id;
                  const isTarget = dragOverTargetId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`order-project-card ${isDragging ? "is-dragging" : ""} ${
                        isTarget ? "is-drag-over" : ""
                      } ${previewMode ? "preview-only" : ""}`}
                      draggable={!previewMode}
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragOver={(e) => handleDragOverCard(e, item.id, category.id)}
                      onDrop={(e) => handleDropOnSection(e, category.id)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Top Bar on the Card with Position and Category */}
                      <div className="card-top-header">
                        <div className="card-position-badge">
                          <span className="position-number">#{catIdx + 1} na Sessão</span>
                          {catIdx === 0 && (
                            <span className="featured-tag">★ Destaque</span>
                          )}
                        </div>

                        {/* Category Switcher Dropdown */}
                        {!previewMode && (
                          <div className="category-select-wrapper">
                            <label className="cat-change-label">Mover para:</label>
                            <select
                              className="category-change-select"
                              value={item.category || "Profissional"}
                              onChange={(e) => changeItemCategory(item.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="Profissional">🏢 Profissional</option>
                              <option value="Pessoal">🚀 Pessoal</option>
                              <option value="Acadêmico">🎓 Acadêmico</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Tags row identical to the live site */}
                      <div className="project-header">
                        {item.tags?.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className={`tag ${tIdx === 1 ? "font-bold" : ""}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {item.contentType === "google-docs" && (
                          <span className="tag font-bold gdocs-tag">Google Docs</span>
                        )}
                        {item.contentType === "pdf" && (
                          <span className="tag font-bold pdf-tag">PDF</span>
                        )}
                      </div>

                      {/* Title & Short Description */}
                      <h3>{item.title}</h3>
                      <p>{item.shortDescription || item.aboutContext || "Sem descrição definida."}</p>

                      {/* Footer links preview */}
                      <div className="project-links">
                        {item.github && (
                          <a
                            href={item.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-arrow"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View GitHub <span>→</span>
                          </a>
                        )}
                        {item.demo && (
                          <a
                            href={item.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-arrow"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Live Demo <span>→</span>
                          </a>
                        )}
                        {onOpenProjectDetail && (
                          <button
                            type="button"
                            className="link-arrow detail-preview-link"
                            onClick={() => onOpenProjectDetail(item)}
                          >
                            Saber Mais <span>→</span>
                          </button>
                        )}
                      </div>

                      {/* Interactive Reordering Controls within Category */}
                      {!previewMode && (
                        <div className="card-order-controls">
                          <div
                            className="drag-grip"
                            title="Arraste para reposicionar dentro da sessão ou soltar em outra sessão"
                          >
                            <span className="grip-icon">⋮⋮</span>
                            <span className="grip-label">Arrastar</span>
                          </div>

                          <div className="order-nav-buttons">
                            <button
                              type="button"
                              className="move-btn"
                              disabled={catIdx === 0}
                              onClick={() => moveToTopCategory(category.id, catIdx)}
                              title="Mover para o 1º lugar da sessão"
                            >
                              ⤒ Topo
                            </button>
                            <button
                              type="button"
                              className="move-btn"
                              disabled={catIdx === 0}
                              onClick={() => moveItemWithinCategory(category.id, catIdx, -1)}
                              title="Subir posição na sessão"
                            >
                              ◀
                            </button>
                            <button
                              type="button"
                              className="move-btn"
                              disabled={catIdx === categoryItems.length - 1}
                              onClick={() => moveItemWithinCategory(category.id, catIdx, 1)}
                              title="Descer posição na sessão"
                            >
                              ▶
                            </button>
                            <button
                              type="button"
                              className="move-btn"
                              disabled={catIdx === categoryItems.length - 1}
                              onClick={() => moveToBottomCategory(category.id, catIdx)}
                              title="Mover para o final da sessão"
                            >
                              ⤓ Fim
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {categoryItems.length === 0 && (
                <div className="session-empty-dropzone">
                  <p>Nenhum item nesta sessão.</p>
                  <span>Arraste um card até aqui para adicioná-lo à categoria {category.label}</span>
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}
