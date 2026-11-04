import { useState, useEffect } from "react";
import {
  loginWithEmail,
  signupWithEmail,
  loginWithGitHub,
  getCurrentUser,
  logoutUser,
  isAuthorizedAdmin
} from "../lib/supabaseService";
import "./LoginDraft.css";

export default function LoginDraft({ onNavigateToAdmin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUpMode] = useState(false);

  useEffect(() => {
    // Se o usuário já estiver logado (ex: retorno do GitHub OAuth)
    getCurrentUser().then((user) => {
      if (user) {
        if (isAuthorizedAdmin(user)) {
          setNotice("Sessão ativa de Matheus de Castro detectada. Redirecionando...");
          setTimeout(() => {
            if (onNavigateToAdmin) onNavigateToAdmin();
            else window.location.href = "/4dm1n";
          }, 500);
        } else {
          logoutUser();
          setErrorNotice("Acesso Negado: Apenas a conta de Matheus de Castro (Matheus-dCastro) possui autorização.");
        }
      }
    });
  }, [onNavigateToAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorNotice("");
    setNotice("");

    if (!email || !password) {
      setErrorNotice("Por favor, preencha o email e a senha.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUpMode) {
        const { data, error } = await signupWithEmail(email, password);
        if (error) throw error;
        setNotice(
          data?.user?.identities?.length === 0
            ? "Este email já possui cadastro. Faça login diretamente."
            : "Cadastro realizado com sucesso! Se a confirmação de email estiver ativada no Supabase, verifique sua caixa de entrada."
        );
      } else {
        const { data, error } = await loginWithEmail(email, password);
        if (error) throw error;
        
        if (!isAuthorizedAdmin(data?.user)) {
          await logoutUser();
          throw new Error("Acesso Negado: Este email não está autorizado como administrador.");
        }

        setNotice("Autenticado como Matheus de Castro! Redirecionando para o painel 4dm1n...");
        setTimeout(() => {
          if (onNavigateToAdmin) onNavigateToAdmin();
          else window.location.href = "/4dm1n";
        }, 600);
      }
    } catch (err) {
      console.error("Erro na autenticação:", err);
      setErrorNotice(err.message || "Credenciais inválidas ou erro de conexão com Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setErrorNotice("");
    setNotice("Redirecionando para o GitHub OAuth...");
    try {
      const { error } = await loginWithGitHub();
      if (error) throw error;
    } catch (err) {
      setErrorNotice(err.message || "Erro ao conectar com GitHub OAuth.");
    }
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
        <span className="secret-route-badge">Supabase Auth • Rota 4dm1n</span>
      </div>

      {notice && (
        <div className="login-preview-notice" style={{ borderColor: "#238636", color: "#3fb950" }}>
          <span>{notice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="login-preview-notice" style={{ borderColor: "#f85149", color: "#f85149" }}>
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Main Login Card */}
      <div className="github-login-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login_field">Email address</label>
            <input
              type="email"
              id="login_field"
              className="github-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="login"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <div className="label-with-link">
              <label htmlFor="password">Password</label>
            
            </div>
            <input
              type="password"
              id="password"
              className="github-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-github-signin" disabled={loading}>
            {loading ? "Autenticando..." : isSignUpMode ? "Cadastrar Administrador" : "Sign in"}
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
          disabled={loading}
        >
          <svg height="18" viewBox="0 0 16 16" width="18" fill="currentColor">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
          Sign in with GitHub
        </button>
      </div>

    
    </div>
  );
}