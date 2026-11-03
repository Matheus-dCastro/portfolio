import { useState } from "react";
import "./LoginDraft.css";

export default function LoginDraft({ onBackToHome, onNavigateToAdmin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotice("⚡ Modo Prévia de Design: A integração real com Supabase Auth será realizada no sábado!");
  };

  const handleGitHubLogin = () => {
    setNotice("⚡ Modo Prévia de Design: OAuth com GitHub via Supabase Auth será configurado no sábado!");
  };

  return (
    <div className="github-login-layout">
      {/* GitHub Octocat Logo */}
      <div className="github-login-brand">
        <svg
          height="48"
          aria-hidden="true"
          viewBox="0 0 16 16"
          version="1.1"
          width="48"
          fill="#ffffff"
          className="octocat-icon"
        >
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg>
        <h1 className="github-login-heading">Sign in to Matheus's Portfolio</h1>
        <span className="secret-route-badge">Rota Secreta /l0g1n • 4dm1n Entry</span>
      </div>

      {notice && (
        <div className="login-preview-notice">
          <span>{notice}</span>
        </div>
      )}

      {/* Main Login Card */}
      <div className="github-login-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login_field">Username or email address</label>
            <input
              type="text"
              id="login_field"
              className="github-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="matheus.vsf.castro.25@gmail.com"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <div className="label-with-link">
              <label htmlFor="password">Password</label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); setNotice("Recuperação de senha via Supabase Auth."); }}>
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              id="password"
              className="github-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-github-signin">
            Sign in
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        {/* OAuth with GitHub */}
        <button
          type="button"
          className="btn-github-oauth"
          onClick={handleGitHubLogin}
        >
          <svg height="18" viewBox="0 0 16 16" width="18" fill="currentColor">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
          Sign in with GitHub
        </button>
      </div>

      {/* Secondary Preview Access Box */}
      <div className="github-sub-card">
        <p>Acesso restrito para gestão de projetos, artigos e ordens.</p>
        <button
          type="button"
          className="btn-quick-admin"
          onClick={() => {
            if (onNavigateToAdmin) onNavigateToAdmin();
            else window.location.href = "/4dm1n";
          }}
        >
          ⚡ Acessar Painel 4dm1n (Modo Rascunho) →
        </button>
      </div>

      {/* Footer Navigation */}
      <footer className="github-login-footer">
        <button type="button" className="btn-back-home" onClick={onBackToHome}>
          ← Voltar ao Portfólio Público
        </button>
        <div className="footer-links-row">
          <span>Protected by Supabase Auth</span>
          <span>•</span>
          <span>SSL 256-bit Encrypted</span>
          <span>•</span>
          <span>Free Tier Ready</span>
        </div>
      </footer>
    </div>
  );
}
