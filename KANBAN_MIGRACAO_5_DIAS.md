# ⚡ Kanban Sprint de Final de Semana: Migração Supabase & Agente IA

> **Estratégia Intensiva para Sexta, Sábado e Domingo**  
> *Hospedagem:* GitHub Pages (100% Gratuito)  
> *Backend & Banco de Dados:* Supabase Free Tier (PostgreSQL + Auth + Edge Functions)  
> *Inteligência Artificial:* Qwen 2.5 Coder 32B via Groq API & Edge Function Serverless  
> *Status do Front-End React:* Interface, UX, drafts de edição, ordenação, anexos, galeria modernizada e chatbot Qwen implementados!

---

> [!IMPORTANT]
> ### 🛡️ DIRETRIZ MANDATÓRIA DE SEGURANÇA (A SER ATUALIZADA):
> **NADA de segurança, chaves de API secretas (Groq/OpenAI/etc.) ou credenciais/tokens de login deve ser guardado no `localStorage` para manter o sistema seguro.**
> 
> **Motivação:** O `localStorage` é compartilhado no contexto do navegador e vulnerável a scripts maliciosos (XSS) e inspeção direta pelo usuário/visitante.
> 
> **Plano de Blindagem para as Próximas Atualizações:**
> 1. **Zero Chaves de IA no Navegador:** As chaves de LLM (ex: `GROQ_API_KEY`) devem residir exclusivamente nos *Secrets do Supabase* (`supabase secrets set GROQ_API_KEY=...`) e serem invocadas através de uma **Edge Function Serverless** (`supabase.functions.invoke('chat-qwen')`), sem nunca trafegar para o frontend.
> 2. **Autenticação Segura:** Sessões de login de administrador devem usar tokens efêmeros gerenciados diretamente pelo Supabase Auth (com refresh token seguro), sem persistência manual de senhas ou tokens administrativos em texto puro no `localStorage`.
> 3. **Uso Restrito do LocalStorage:** O `localStorage` deve ser mantido **apenas e exclusivamente** como cache offline secundário para conteúdos públicos (textos de projetos, artigos já publicados e temas visuais).

---

## 🎯 Visão Geral da Ordem de Execução
A ordem foi planejada para garantir que o portfólio tradicional e o painel de controle fiquem 100% funcionais e publicados primeiro. **O modelo de LLM (Qwen) será estritamente o último passo de todo o projeto**.

```
[ Sexta-Feira à Noite ] ──► [ Sábado de Manhã ] ──► [ Sábado à Tarde ] ──► [ Domingo de Manhã ] ──► [ Domingo à Tarde/Noite ]
   Supabase & SQL DDL         SDK & Leituras (SELECT)     /l0g1n Auth & CRUD     QA & Deploy GitHub Pages    ÚLTIMO PASSO: Agente Qwen
```

---

## 📅 SEXTA-FEIRA À NOITE: Setup do Supabase & Segurança RLS (Free Tier)
**Meta:** Ter o banco de dados PostgreSQL estruturado, populado e blindado contra acessos indevidos antes de dormir.

### Bloco 1: Criação e Configuração da Nuvem Supabase
- [x] Criar conta/projeto gratuito no [Supabase](https://supabase.com) (selecionar região `sa-east-1 - São Paulo`).
- [x] Copiar as chaves do projeto no menu **Project Settings > API**:
  - `Project URL`
  - `anon / public key`
- [x] Criar o arquivo `.env` na raiz do projeto (não commitado no Git):
  ```env
  VITE_SUPABASE_URL=https://seu-projeto.supabase.co
  VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
  VITE_GROQ_API_KEY=gsk_sua-chave-groq-aqui
  ```

### Bloco 2: Execução do Schema DDL & Segurança RLS
- [x] Acessar o **SQL Editor** do Supabase e executar o script DDL completo documentado em [ROADMAP_SUPABASE_SEGURANCA_IA.md](file:///home/alomy/portfolio/ROADMAP_SUPABASE_SEGURANCA_IA.md) e [supabase/schema.sql](file:///home/alomy/portfolio/supabase/schema.sql):
  - [x] Criação dos ENUMs (`project_category_enum`, `content_source_enum`).
  - [x] Criação das tabelas `works`, `articles`, `thoughts`, `agent_configs`, `cv_configs` e `drawings`.
  - [x] Criação dos campos de anexo bidirecional (`related_article_id` em `works` e `related_work_id` em `articles`).
  - [x] Criação dos índices de performance e triggers de `updated_at`.
- [x] Executar o script de **Row Level Security (RLS)**:
  - [x] Habilitar RLS em todas as tabelas.
  - [x] Garantir que o visitante (`anon`) possua **APENAS** permissão de `SELECT` onde `is_published = true`.
  - [x] Garantir que escrita (`INSERT`, `UPDATE`, `DELETE`) exija token autenticado (`authenticated`).

### Bloco 3: Seed Inicial dos Dados
- [x] Executar script de inserção inicial com os dados existentes em [src/data/projectsData.js](file:///home/alomy/portfolio/src/data/projectsData.js) (AgentMetrics, U-Net Segmentation, TimeMaster, artigos, pensamentos e desenhos) para que o banco já nasça populado.

---

## 📅 SÁBADO DE MANHÃ: SDK e Conexão das Leituras Públicas (Front-End)
**Meta:** Fazer o site público carregar dados em tempo real direto do Supabase.

### Bloco 4: Instalação do SDK e Singleton Client
- [x] Executar no terminal `npm install @supabase/supabase-js`.
- [x] Criar o cliente em `src/lib/supabaseClient.js`:
  - [x] Sanitização e leitura de `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
  - [x] Implementação de fallback transparente para `localStorage` caso as variáveis não estejam configuradas (sistema nunca quebra).

### Bloco 5: Conexão das Leituras Públicas (SELECT)
- [x] Interface de projetos dividida nas 3 sessões (**Profissional**, **Pessoal**, **Acadêmico**) com filtros dinâmicos ([src/components/Projects.jsx](file:///home/alomy/portfolio/src/components/Projects.jsx)).
- [x] Interface de artigos técnicos com atalhos de leitura ([src/components/Articles.jsx](file:///home/alomy/portfolio/src/components/Articles.jsx)).
- [x] Pensamentos transferidos exclusivamente para a página de Hobbies com suporte a links Google Docs e PDF ([src/Hobbies.jsx](file:///home/alomy/portfolio/src/Hobbies.jsx)).
- [x] Botão e modal de anexo bidirecional (Projeto ↔ Artigo) no editor e no leitor ([src/components/AdminDraft.jsx](file:///home/alomy/portfolio/src/components/AdminDraft.jsx), [src/components/ViewDraft.jsx](file:///home/alomy/portfolio/src/components/ViewDraft.jsx)).
- [x] Modal popup de escolha do currículo com dual-mode: **Versão Web Interativa (Google Docs)** e **Documento Oficial PDF** ([src/components/Perfil.jsx](file:///home/alomy/portfolio/src/components/Perfil.jsx), [src/style.css](file:///home/alomy/portfolio/src/style.css)).
- [x] Conexão assíncrona de `Projects.jsx` para buscar da tabela `works` com suporte a listas vazias.
- [x] Conexão de `Articles.jsx` para buscar da tabela `articles`.
- [x] Conexão de `Hobbies.jsx` para buscar pensamentos e desenhos (`fetchThoughts`, `fetchDrawings`).
- [x] Galeria de artes (`ArtGallery.jsx`) integrada ao Supabase com visual modernizado, counter, navegação por teclado e lightbox com legendas.

---

## 📅 SÁBADO À TARDE: Autenticação (`/l0g1n`), Operações de Escrita (Admin) & Desenhos
**Meta:** Permitir que Matheus faça login na rota secreta `/l0g1n` e gerencie projetos, artigos, CV e desenhos na nuvem.

### Bloco 6: Supabase Auth e Rota Secreta `/l0g1n`
- [x] Desenvolver a pré-tela de login no estilo dark GitHub na rota secreta `/l0g1n` ([src/components/LoginDraft.jsx](file:///home/alomy/portfolio/src/components/LoginDraft.jsx)).
- [x] Conectar o formulário de `/l0g1n` ao `supabase.auth.signInWithPassword({ email, password })`.
- [x] Bloquear o acesso às telas `/4dm1n` e `/draft-order` caso o usuário não possua sessão autenticada.
- [x] Adicionar rotas físicas em `vite.config.js` (`4dm1n/index.html`, `l0g1n/index.html`, `draft-order/index.html`, etc.) e `404.html` para evitar erro 404 no GitHub Pages.

### Bloco 7: Conexão de Salvamento, Ordem Real & Gestão de Desenhos
- [x] Editor rico com atalhos Word/Obsidian, botão de anexo e leitor Google Docs/PDF ([src/components/AdminDraft.jsx](file:///home/alomy/portfolio/src/components/AdminDraft.jsx)).
- [x] Organizador de vitrine em cards com separação por tipo e botões de mover ([src/components/OrderDraft.jsx](file:///home/alomy/portfolio/src/components/OrderDraft.jsx)).
- [x] Aba de gestão de currículo no `/4dm1n` (`📄 Currículo (CV)`) com upload drag-and-drop de PDF para o Supabase Storage e prévia interativa ao vivo.
- [x] Aba de gestão de desenhos (`🎨 Desenhos`) no `/4dm1n` com upload drag-and-drop de imagens para o Supabase Storage, prévia em tempo real e reordenação (setas ▲/▼ e input numérico).
- [x] Conectar botão "Salvar" e "Excluir" com `persistWork`, `persistArticle`, `persistThought`, `persistDrawing` e `persistExperience`.
- [x] Conectar ordenação em lote com `persistBatchOrder` para `projects`, `articles`, `thoughts` e `drawings`.

---

## 📅 DOMINGO DE MANHÃ: QA, Build & Deploy no GitHub Pages
**Meta:** Garantir que o portfólio dinâmico completo esteja no ar e 100% testado no GitHub Pages antes de mexer na IA.

### Bloco 8: Auditoria e Build de Produção
- [x] Correção de sobreposição da topbar/header em todas as telas ([src/style.css](file:///home/alomy/portfolio/src/style.css)).
- [x] Headers de edição, organização e saber mais integrados e estáticos ([src/components/AdminDraft.css](file:///home/alomy/portfolio/src/components/AdminDraft.css), [src/components/OrderDraft.css](file:///home/alomy/portfolio/src/components/OrderDraft.css), [src/components/ViewDraft.css](file:///home/alomy/portfolio/src/components/ViewDraft.css)).
- [x] Espaçamento compacto entre categorias de visualizações ([src/style.css](file:///home/alomy/portfolio/src/style.css)).
- [x] Link "Artigos" no menu principal e botões intuitivos de acesso ([src/components/HeadSite.jsx](file:///home/alomy/portfolio/src/components/HeadSite.jsx), [src/components/Perfil.jsx](file:///home/alomy/portfolio/src/components/Perfil.jsx), [src/components/Projects.jsx](file:///home/alomy/portfolio/src/components/Projects.jsx)).
- [x] Rodar testes de build e auditoria: `npm run lint` e `npm run build` passando com 0 erros.

### Bloco 9: Deploy Gratuito no GitHub Pages
- [x] Configurar o `vite.config.js` com `base: './'` para suportar caminhos relativos no GitHub Pages.
- [x] Adicionar script de deploy no `package.json`:
  ```json
  "deploy": "vite build && gh-pages -d dist"
  ```
- [x] Executar deploy e validar a aplicação funcionando online no GitHub Pages.

---

## 📅 DOMINGO À TARDE/NOITE: Assistente Virtual IA (Qwen 2.5 via Groq API)
**Meta:** Plugar o Agente de IA com inferência ultra-rápida (Groq API Key configurada na branch isolada `feature/groq-llm-integration`).

### Bloco 10: Serviço LLM & Simulador Admin
- [x] Chave de API Groq configurada no `.env` (`VITE_GROQ_API_KEY`).
- [x] Criação do serviço `src/lib/llmService.js`:
  - [x] Conexão com API Groq (`qwen/qwen3.8-27b` com fallback automático para `openai/gpt-oss-120b`).
  - [x] Injeção dinâmica da Base de Conhecimento do portfólio (projetos, artigos, experiências e currículo).
  - [x] System prompt rígido anti-alucinação com recusa cordial de temas fora do escopo.
- [x] Simulador de chat funcional no painel de administração (`/4dm1n`) conectado à API real do Qwen.

### Bloco 11: Widget Flutuante de Chat na Vitrine Pública
- [x] Criação do componente visual flutuante `src/components/ChatWidget.jsx` e `src/components/ChatWidget.css`.
- [x] Botão flutuante moderno com pulso neon e chat popup responsivo.
- [x] Chips de perguntas rápidas sugeridas ("Quais os principais projetos?", "Qual a formação?", etc.).
- [x] Integração nas telas públicas (`Home`, `Hobbies`, `ViewDraft`).

---

## 🔒 PRÓXIMA ATUALIZAÇÃO: Refatoração de Segurança & Zero Secrets no LocalStorage
**Meta:** Eliminar qualquer chave de API ou credencial do cliente/localStorage, isolando a inferência na nuvem Supabase.

### Bloco 12: Migração para Supabase Edge Function (`/chat-qwen`)
- [ ] Criar a Edge Function `supabase/functions/chat-qwen/index.ts`.
- [ ] Salvar a secret no Supabase Cloud:
  ```bash
  npx supabase secrets set GROQ_API_KEY=sua-chave-aqui
  ```
- [ ] Fazer deploy da Edge Function na nuvem Supabase:
  ```bash
  npx supabase functions deploy chat-qwen
  ```
- [ ] Atualizar `src/lib/llmService.js` para chamar `supabase.functions.invoke('chat-qwen', ...)` em vez de chamar diretamente a API da Groq no frontend.
- [ ] Remover permanentemente quaisquer leituras ou fallbacks de chaves secretas no `localStorage` do navegador.
- [ ] Garantir que o `localStorage` armazene estritamente cache de dados públicos já exibidos e preferências visuais.
