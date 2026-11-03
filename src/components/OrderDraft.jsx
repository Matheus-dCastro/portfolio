import { useState } from "react";
import "./OrderDraft.css";

export default function OrderDraft({ onBackToHome }) {
  const [activeTab, setActiveTab] = useState("projects");

  return (
    <div className="order-draft-container">
      <div className="order-header">
        <div className="order-header-left">
          <h2>Organizar Exibição (Draft)</h2>
          <nav className="order-nav">
            <button
              className={activeTab === "projects" ? "active" : ""}
              onClick={() => setActiveTab("projects")}
            >
              Ordem dos Projetos
            </button>
            <button
              className={activeTab === "articles" ? "active" : ""}
              onClick={() => setActiveTab("articles")}
            >
              Ordem dos Artigos
            </button>
          </nav>
        </div>
        <div className="order-header-right">
          <button className="back-button" onClick={onBackToHome}>Voltar ao Site</button>
          <button className="publish-btn">🚀 Publicar Nova Ordem no Site</button>
        </div>
      </div>

      <main className="order-content">
        <div className="order-instructions">
          <p>Arraste os itens para cima ou para baixo para definir a ordem em que eles aparecerão na página inicial do seu portfólio.</p>
        </div>

        <div className="order-list">
          {/* Draggable items list */}
          <div className="order-item" draggable="true">
            <div className="drag-handle">⋮⋮</div>
            <div className="item-details">
              <span className="item-position">1</span>
              <span className="item-title">Exemplo de {activeTab} - Principal</span>
            </div>
            <span className="badge">Profissional</span>
          </div>

          <div className="order-item" draggable="true">
            <div className="drag-handle">⋮⋮</div>
            <div className="item-details">
              <span className="item-position">2</span>
              <span className="item-title">Outro {activeTab} Destaque</span>
            </div>
            <span className="badge">Pessoal</span>
          </div>

          <div className="order-item" draggable="true">
            <div className="drag-handle">⋮⋮</div>
            <div className="item-details">
              <span className="item-position">3</span>
              <span className="item-title">{activeTab} Secundário</span>
            </div>
            <span className="badge">Acadêmico</span>
          </div>

          <div className="order-item" draggable="true">
            <div className="drag-handle">⋮⋮</div>
            <div className="item-details">
              <span className="item-position">4</span>
              <span className="item-title">{activeTab} Mais Antigo</span>
            </div>
            <span className="badge">Profissional</span>
          </div>
        </div>
      </main>
    </div>
  );
}
