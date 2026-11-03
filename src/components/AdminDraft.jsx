import { useState } from "react";
import "./AdminDraft.css"; // We will create this for specific admin styles

export default function AdminDraft({ onBackToHome }) {
  const [activeTab, setActiveTab] = useState("projects");
  const [editorContent, setEditorContent] = useState("# Título Inicial\n\nComece a escrever aqui...");

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-left">
          <h2>Dashboard 4dm1n (Draft)</h2>
          <nav className="admin-nav">
            <button
              className={activeTab === "projects" ? "active" : ""}
              onClick={() => setActiveTab("projects")}
            >
              Projetos
            </button>
            <button
              className={activeTab === "articles" ? "active" : ""}
              onClick={() => setActiveTab("articles")}
            >
              Artigos
            </button>
            <button
              className={activeTab === "thoughts" ? "active" : ""}
              onClick={() => setActiveTab("thoughts")}
            >
              Pensamentos
            </button>
          </nav>
        </div>
        <button className="back-btn" onClick={onBackToHome}>Voltar ao Site</button>
      </div>

      <main className="admin-main">
        {/* SIDEBAR: Notion-like Card List */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <h3>{activeTab === "projects" ? "Meus Projetos" : activeTab === "articles" ? "Artigos Científicos" : "Meus Pensamentos"}</h3>
            <button className="new-btn">+ Novo</button>
          </div>

          <div className="card-list">
            {/* Notion style cards with Drag handles */}
            <div className="admin-card active" draggable="true">
              <div className="card-drag-handle">⋮⋮</div>
              <div className="card-content-area">
                <h4>1. Exemplo de {activeTab} Principal</h4>
                <p className="card-meta">Atualizado hoje</p>
                <span className="badge">Profissional</span>
              </div>
            </div>
            <div className="admin-card" draggable="true">
              <div className="card-drag-handle">⋮⋮</div>
              <div className="card-content-area">
                <h4>2. Exemplo de {activeTab} Secundário</h4>
                <p className="card-meta">Ontem</p>
                <span className="badge">Pessoal</span>
              </div>
            </div>
            <div className="admin-card" draggable="true">
              <div className="card-drag-handle">⋮⋮</div>
              <div className="card-content-area">
                <h4>3. Exemplo de {activeTab} Antigo</h4>
                <p className="card-meta">Semana passada</p>
                <span className="badge">Acadêmico</span>
              </div>
            </div>
          </div>

          <div className="sidebar-footer">
            <button className="publish-order-btn" onClick={() => window.location.href = '/draft-order'}>
              ☰ Gerenciar Ordem do Site
            </button>
          </div>
        </aside>

        {/* EDITOR: Obsidian/Word style */}
        <section className="admin-editor-area">
          <div className="editor-toolbar">
            <button><b>B</b></button>
            <button><i>I</i></button>
            <button><s>S</s></button>
            <span className="separator">|</span>
            <button>H1</button>
            <button>H2</button>
            <span className="separator">|</span>
            <button>Link</button>
            <button>Imagem</button>
            <span className="separator">|</span>
            <button title="Importar PDF para o conteúdo">📥 Importar PDF</button>
            <button title="Exportar conteúdo como PDF">📤 Exportar PDF</button>
            <div className="toolbar-spacer"></div>
            <select className="type-selector">
              <option>📌 Tipo: Projeto</option>
              <option>📑 Tipo: Artigo</option>
              <option>🔗 Tipo: Artigo de Projeto</option>
              <option>💭 Tipo: Pensamento</option>
            </select>
            <button className="save-btn">Salvar Alterações</button>
          </div>

          <div className="editor-form">
            <input type="text" className="title-input" placeholder="Título..." defaultValue="Exemplo de Item 1" />

            <div className="meta-inputs">
              <input type="text" placeholder="Link (GitHub, Plataforma...)" />
              <input type="text" placeholder="Tags / Categoria..." />
              <button className="link-entity-btn" title="Vincular Artigo a um Projeto ou Projeto a um Artigo">
                🔗 Vincular a {activeTab === 'projects' ? 'Artigo' : 'Projeto'}
              </button>
            </div>

            <div className="meta-inputs">
              <input type="text" placeholder="Resumo / Contexto IA (Campo 'Sobre')..." style={{flex: 2}} />
            </div>

            <div className="editor-split-view">
              <textarea
                className="markdown-editor"
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="Escreva em Markdown (estilo Obsidian)..."
              ></textarea>

              <div className="pdf-preview-pane">
                <div className="pdf-placeholder">
                  <span className="pdf-icon">📄</span>
                  <p>Pré-visualização do PDF Importado/Exportado aparecerá aqui</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
