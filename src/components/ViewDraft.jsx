
import "./ViewDraft.css";

export default function ViewDraft({ onBackToHome }) {
  return (
    <div className="view-draft-container">
      <div className="view-header">
        <button className="back-button" onClick={onBackToHome}>
          ← Voltar
        </button>
        <div className="header-actions">
          <a href="#" className="repo-button" target="_blank" rel="noopener noreferrer">
            <span className="icon">🔗</span> Abrir Repositório
          </a>
        </div>
      </div>

      <main className="view-content">
        <article className="view-article">
          <div className="article-meta">
            <span className="article-tag">Profissional</span>
            <span className="article-date">Publicado em 24 de Outubro, 2023</span>
          </div>

          <h1 className="article-title">Exemplo de Título do Projeto ou Artigo</h1>

          <p className="article-abstract">
            <strong>Resumo / Sobre:</strong> Este é um texto de contexto introdutório que o agente de IA usa para entender o projeto, mas que também serve como uma breve sinopse para o leitor humano antes de aprofundar na leitura completa.
          </p>

          {/* Placeholder for PDF or main image */}
          <div className="media-placeholder">
            <span>🖼️ / 📄 Imagem de Capa ou PDF Integrado</span>
          </div>

          <div className="markdown-content">
            <h2>Introdução</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla accumsan, metus ultrices eleifend gravida, nulla nunc varius lectus, nec rutrum justo nibh eu lectus. Ut vulputate semper dui.
            </p>

            <h3>Tecnologias Utilizadas</h3>
            <ul>
              <li>React</li>
              <li>Node.js</li>
              <li>PostgreSQL (Supabase)</li>
            </ul>

            <p>
              Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
            </p>

            <blockquote>
              "Uma citação importante retirada dos estudos ou pensamentos relacionados ao projeto."
            </blockquote>

            <p>Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis.</p>
          </div>
        </article>

        <footer className="view-footer">
          <div className="footer-actions">
            <p>Gostou do que leu? Explore o código fonte!</p>
            <a href="#" className="repo-button large" target="_blank" rel="noopener noreferrer">
              <span className="icon">🔗</span> Abrir Repositório Completo no GitHub
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
