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
            <h3>{activeTab === "projects" ? "Meus Projetosos" : activeTab === "articles" ? "Artigos Científicos" : "Meus Pensamentos"}</h3>
            <button className="new-btn">+ Novo</button>
          </div>

          <div className="card-list">
            {/* Notion style cards */}
            <div className="admin-card active">
              <h4>Exemplo de {activeTab} 1</h4>
              <p className="card-meta">Atualizado hoje</p>
              <span className="badge">Profissional</span>
            </div>
            <div className="admin-card">
              <h4>Exemplo de {activeTab} 2</h4>
              <p className="card-meta">Ontem</p>
              <span className="badge">Pessoal</span>
            </div>
            <div className="admin-card">
              <h4>Exemplo de {activeTab} 3</h4>
              <p className="card-meta">Semana passada</p>
              <span className="badge">Acadêmico</span>
            </div>
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
            <div className="toolbar-spacer"></div>
            <button className="save-btn">Salvar Alterações</button>
          </div>

          <div className="editor-form">
            <input type="text" className="title-input" placeholder="Título..." defaultValue="Exemplo de Item 1" />

            <div className="meta-inputs">
              <input type="text" placeholder="Tags / Categoria..." />
              <input type="text" placeholder="Resumo / Contexto IA (Campo 'Sobre')..." />
            </div>

            <textarea
              className="markdown-editor"
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              placeholder="Escreva em Markdown (estilo Obsidian)..."
            ></textarea>
          </div>
        </section>
      </main>
    </div>
  );
}
