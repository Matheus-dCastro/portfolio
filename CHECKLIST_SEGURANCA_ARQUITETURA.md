# Checklist de Seguranca e Arquitetura - Portfolio

Documento de acompanhamento em tempo real das correcoes de seguranca, saneamento de credenciais e organizacao arquitetural.

---

## 1. Mapeamento & Sincronizacao de Branches
- [x] Analise do estado das branches locais e remotas (`origin/main`, `origin/fix/chat-token-length-limit`, `origin/refatoring-securit`).
- [x] Verificacao da branch de limites de tokens: confirmada integracao em `main` com Edge Function otimizada (`supabase/functions/chat-qwen/index.ts`).
- [x] Mapeamento detalhado dos pontos de vulnerabilidade no codigo e nas politicas SQL.

---

## 2. Eliminacao de Chaves e Sanitizacao Client-Side
- [x] Remocao do array de decodificacao XOR de chave de API em `src/lib/llmService.js` (`getGroqApiKey`).
- [x] Refatoracao do fluxo de inferencia do chat: chamada prioritaria para Supabase Edge Function (`chat-qwen`).
- [x] Prevencao de vazamento de secrets em `persistAgentConfig`: eliminacao do vazamento de tags `<!-- AGENT_KEY: ... -->` no prompt compartilhado.
- [x] Higienizacao de `localStorage`: remocao de armazenamento de tokens ou secrets locais de IA no navegador.

---

## 3. Protecao de Rotas e Controle de Acesso Administrativo
- [x] Implementacao de Route Guard rigido em `src/components/AdminDashboard.jsx`: visitantes sem sessao ativa sao redirecionados imediatamente para `/login`.
- [x] Implementacao de Route Guard em `src/App.jsx` e `src/components/OrderManager.jsx`.
- [x] Bloqueio de renderizacao de abas sensiveis para usuarios nao autenticados.
- [x] Preservacao e validacao integral do fluxo de login com GitHub OAuth.

---

## 4. Blindagem do Banco de Dados (Supabase RLS & Schema)
- [x] Criacao da migration SQL de seguranca em `supabase/migrations/20261112_harden_security_rls.sql`:
  - [x] Criacao da funcao `public.is_admin()` que valida e-mail e username do GitHub.
  - [x] Revogacao de `SELECT` publico irrestrito sobre a coluna `groq_api_key` em `agent_configs`.
  - [x] Restricao de escrita (`INSERT`, `UPDATE`, `DELETE`) em todas as tabelas (`works`, `articles`, `thoughts`, `drawings`, `cv_configs`, `agent_configs`, `blog_posts`) para validar explicitamente `public.is_admin()`.
  - [x] Restricao de escrita e delecao no bucket de Storage `documents` para validar `public.is_admin()`.
  - [x] Atualizacao correspondente em `supabase/schema.sql`.

---

## 5. Instrucoes de Acao Manual do Usuario
- [x] Criacao do arquivo `coisas_securtycastro.md` na raiz com o passo a passo exato para:
  - [x] Rotacao e revogacao de chaves no painel Groq Cloud.
  - [x] Aplicacao do script SQL no SQL Editor do Supabase.
  - [x] Desativacao de cadastro publico (sign up) no Supabase Auth.
  - [x] Configuracao de Secrets no Supabase CLI (`npx supabase secrets set GROQ_API_KEY=...`).
  - [x] Deploy da Edge Function (`npx supabase functions deploy chat-qwen`).

---

## 6. Organizacao Arquitetural & Refatoracao de Componentes
- [x] Renomeacao de telas consolidadas de rascunho para producao:
  - `AdminDraft.jsx` / `.css` -> `AdminDashboard.jsx` / `.css`
  - `LoginDraft.jsx` / `.css` -> `Login.jsx` / `.css`
  - `OrderDraft.jsx` / `.css` -> `OrderManager.jsx` / `.css`
  - `ViewDraft.jsx` / `.css` -> `ProjectDetail.jsx` / `.css`
- [x] Refatoracao do Blog (`BlogPage.jsx` e `BlogGateway.jsx`):
  - [x] Unificacao visual completa da topbar: adocao do menu estilo pilula flutuante de vidro fume (`site-header`) identico ao portfolio principal tanto no Blog quanto no Gateway de canais.
  - [x] UX/UI aprimorada: barra dinamica de progresso de leitura integrada ao contorno da pilula, breadcrumbs estruturados no leitor e botao flutuante de retorno ao topo.
  - [x] Barra ativa de contagem de publicacoes encontradas com botao "Limpar Filtros".
  - [x] Substituicao de emojis coloridos por icones vetoriais SVG monocromaticos.
  - [x] Otimizacao da navegacao de feed e do leitor de artigos.
- [x] Sanitizacao de variaveis e imports: `npm run lint` passou com 0 erros.
- [x] Compilacao de producao (`npm run build`) concluida com sucesso absoluto em 263ms.
- [x] Deploy Gate: Autorizado pelo usuario ("quando acabar faz commit e deploy ok"). Executando commit e deploy via GitHub Pages.
