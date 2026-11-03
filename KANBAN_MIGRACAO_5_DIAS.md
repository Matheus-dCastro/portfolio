# ⚡ Kanban Sprint de Final de Semana: Migração Supabase & Agente IA

> **Estratégia Intensiva para Sexta, Sábado e Domingo**  
> *Hospedagem:* GitHub Pages (100% Gratuito)  
> *Backend & Banco de Dados:* Supabase Free Tier (PostgreSQL + Auth + Edge Functions)  
> *Inteligência Artificial (ÚLTIMO PASSO DE TUDO):* Qwen 2.5 Coder 32B via Edge Function Serverless  
> *Status do Front-End React:* Interface, UX, drafts de edição, ordenação, anexos e pré-tela de login `/l0g1n` já implementados!

---
# TODOS OS PDFs DEVEM SER ARRASTAVEIS E UP

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
- [ ] Criar conta/projeto gratuito no [Supabase](https://supabase.com) (selecionar região `sa-east-1 - São Paulo`).
- [ ] Copiar as chaves do projeto no menu **Project Settings > API**:
  - `Project URL`
  - `anon / public key`
- [ ] Criar o arquivo `.env.local` na raiz do projeto (não commitado no Git):
  ```env
  VITE_SUPABASE_URL=https://seu-projeto.supabase.co
  VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
  ```

### Bloco 2: Execução do Schema DDL & Segurança RLS
- [ ] Acessar o **SQL Editor** do Supabase e executar o script DDL completo documentado em [ROADMAP_SUPABASE_SEGURANCA_IA.md](file:///home/alomy/portfolio/ROADMAP_SUPABASE_SEGURANCA_IA.md):
  - [ ] Criação dos ENUMs (`project_category_enum`, `content_source_enum`).
  - [ ] Criação das tabelas `works`, `articles`, `thoughts`, `agent_configs`.
  - [ ] Criação dos campos de anexo bidirecional (`related_article_id` em `works` e `related_work_id` em `articles`).
  - [ ] Criação dos índices de performance e triggers de `updated_at`.
- [ ] Executar o script de **Row Level Security (RLS)**:
  - [ ] Habilitar RLS em todas as tabelas.
  - [ ] Garantir que o visitante (`anon`) possua **APENAS** permissão de `SELECT` onde `is_published = true`.
  - [ ] Garantir que escrita (`INSERT`, `UPDATE`, `DELETE`) exija token autenticado (`authenticated`).

### Bloco 3: Seed Inicial dos Dados
- [ ] Executar script de inserção inicial com os dados existentes em [src/data/projectsData.js](file:///home/alomy/portfolio/src/data/projectsData.js) (AgentMetrics, U-Net Segmentation, TimeMaster, artigos e pensamentos) para que o banco já nasça populado.

---

## 📅 SÁBADO DE MANHÃ: SDK e Conexão das Leituras Públicas (Front-End)
**Meta:** Fazer o site público carregar dados em tempo real direto do Supabase.

### Bloco 4: Instalação do SDK e Singleton Client
- [ ] Executar no terminal:
  ```bash
  npm install @supabase/supabase-js
  ```
- [ ] Criar o cliente em `src/lib/supabaseClient.js`:
  - [ ] Ler variáveis `import.meta.env.VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
  - [ ] Implementar fallback transparente para `localStorage` caso as variáveis não estejam preenchidas (garantindo que o site nunca quebre).

### Bloco 5: Conexão das Leituras Públicas (SELECT)
- [x] Interface de projetos dividida nas 3 sessões (**Profissional**, **Pessoal**, **Acadêmico**) com filtros dinâmicos ([src/components/Projects.jsx](file:///home/alomy/portfolio/src/components/Projects.jsx)).
- [x] Interface de artigos técnicos com atalhos de leitura ([src/components/Articles.jsx](file:///home/alomy/portfolio/src/components/Articles.jsx)).
- [x] Pensamentos transferidos exclusivamente para a página de Hobbies ([src/Hobbies.jsx](file:///home/alomy/portfolio/src/Hobbies.jsx)).
- [x] Botão e modal de anexo bidirecional (Projeto ↔ Artigo) no editor e no leitor ([src/components/AdminDraft.jsx](file:///home/alomy/portfolio/src/components/AdminDraft.jsx), [src/components/ViewDraft.jsx](file:///home/alomy/portfolio/src/components/ViewDraft.jsx)).
- [x] Modal popup de escolha do currículo com dual-mode: **Versão Web Interativa (Google Docs)** e **Documento Oficial PDF** ([src/components/Perfil.jsx](file:///home/alomy/portfolio/src/components/Perfil.jsx), [src/style.css](file:///home/alomy/portfolio/src/style.css)).
- [ ] Substituir o estado inicial estático em `Projects.jsx` por chamada assíncrona:
  ```javascript
  const { data } = await supabase.from('works').select('*').eq('is_published', true).order('display_order', { ascending: true });
  ```
- [ ] Conectar `Articles.jsx` para buscar da tabela `articles`.
- [ ] Conectar seção de pensamentos em `Hobbies.jsx` para buscar da tabela `thoughts`.
- [ ] Conectar `ViewDraft.jsx` para carregar o projeto/artigo selecionado por `id` do Supabase.

---

## 📅 SÁBADO À TARDE: Autenticação (`/l0g1n`) & Operações de Escrita (Admin)
**Meta:** Permitir que Matheus faça login na rota secreta `/l0g1n` e gerencie projetos/artigos na nuvem.

### Bloco 6: Supabase Auth e Rota Secreta `/l0g1n`
- [x] Desenvolver a pré-tela de login no estilo dark GitHub na rota secreta `/l0g1n` ([src/components/LoginDraft.jsx](file:///home/alomy/portfolio/src/components/LoginDraft.jsx)).
- [ ] Habilitar autenticação por **Email/Senha** no painel do Supabase (**Authentication > Providers**).
- [ ] Conectar o formulário de `/l0g1n` ao `supabase.auth.signInWithPassword({ email, password })`.
- [ ] Bloquear o acesso às telas `/4dm1n` e `/draft-order` caso o usuário não possua sessão autenticada.

### Bloco 7: Conexão de Salvamento e Ordem Real
- [x] Editor rico com atalhos Word/Obsidian, botão de anexo e leitor Google Docs/PDF ([src/components/AdminDraft.jsx](file:///home/alomy/portfolio/src/components/AdminDraft.jsx)).
- [x] Organizador de vitrine em cards com separação por tipo e botões de mover ([src/components/OrderDraft.jsx](file:///home/alomy/portfolio/src/components/OrderDraft.jsx)).
- [x] Aba de gestão de currículo no `/4dm1n` (`📄 Currículo (CV)`) permitindo editar link do Google Docs, link/caminho do PDF e data de atualização com prévia interativa ao vivo ([src/components/AdminDraft.jsx](file:///home/alomy/portfolio/src/components/AdminDraft.jsx), [src/components/AdminDraft.css](file:///home/alomy/portfolio/src/components/AdminDraft.css)).
- [ ] Conectar botão "Salvar" de `AdminDraft.jsx` com `supabase.from('works').upsert(...)`.
- [ ] Conectar botão "Excluir" de `AdminDraft.jsx` com `supabase.from('works').delete().eq('id', id)`.
- [ ] Conectar botão "Publicar Nova Ordem" de `OrderDraft.jsx` para atualizar a coluna `display_order` no Supabase em batch.

---

## 📅 DOMINGO DE MANHÃ: QA, Build & Deploy no GitHub Pages
**Meta:** Garantir que o portfólio dinâmico completo esteja no ar e 100% testado no GitHub Pages antes de mexer na IA.

### Bloco 8: Auditoria e Build de Produção
- [x] Correção de sobreposição da topbar/header em todas as telas ([src/style.css](file:///home/alomy/portfolio/src/style.css)).
- [x] Headers de edição, organização e saber mais integrados e estáticos ([src/components/AdminDraft.css](file:///home/alomy/portfolio/src/components/AdminDraft.css), [src/components/OrderDraft.css](file:///home/alomy/portfolio/src/components/OrderDraft.css), [src/components/ViewDraft.css](file:///home/alomy/portfolio/src/components/ViewDraft.css)).
- [x] Espaçamento compacto entre categorias de visualizações ([src/style.css](file:///home/alomy/portfolio/src/style.css)).
- [x] Link "Artigos" no menu principal e botões intuitivos de acesso ([src/components/HeadSite.jsx](file:///home/alomy/portfolio/src/components/HeadSite.jsx), [src/components/Perfil.jsx](file:///home/alomy/portfolio/src/components/Perfil.jsx), [src/components/Projects.jsx](file:///home/alomy/portfolio/src/components/Projects.jsx)).
- [ ] Rodar testes locais de build e preview:
  ```bash
  npm run lint
  npm run build
  npm run preview
  ```

### Bloco 9: Deploy Gratuito no GitHub Pages
- [ ] Configurar o `vite.config.js` com `base: './'` para suportar caminhos relativos no GitHub Pages.
- [ ] Adicionar script de deploy no `package.json`:
  ```json
  "deploy": "vite build && gh-pages -d dist"
  ```
- [ ] Executar deploy e validar a aplicação funcionando online.

---

## 📅 DOMINGO À TARDE/NOITE (ÚLTIMO PASSO DE TUDO): Assistente Virtual IA (Qwen 2.5)
**Meta:** Com todo o portfólio funcionando e publicado, plugar o Agente de IA serverless no Supabase.

### Bloco 10: Deploy da Edge Function Serverless (`chat-qwen`)
- [x] Arquitetura serverless e isolamento de chaves desenhados ([ROADMAP_SUPABASE_SEGURANCA_IA.md](file:///home/alomy/portfolio/ROADMAP_SUPABASE_SEGURANCA_IA.md)).
- [x] System Prompt rígido de produção sem alucinações finalizado ([ROADMAP_SUPABASE_SEGURANCA_IA.md](file:///home/alomy/portfolio/ROADMAP_SUPABASE_SEGURANCA_IA.md)).
- [x] Simulador de chat funcional construído na aba do Admin ([src/components/AdminDraft.jsx](file:///home/alomy/portfolio/src/components/AdminDraft.jsx)).
- [ ] Fazer login no CLI do Supabase:
  ```bash
  npx supabase login
  npx supabase link --project-ref seu-project-ref
  ```
- [ ] Configurar a secret da API do modelo (OpenRouter, HuggingFace ou DashScope gratuito):
  ```bash
  npx supabase secrets set QWEN_API_KEY=sua-chave-aqui
  ```
- [ ] Fazer deploy da Edge Function:
  ```bash
  npx supabase functions deploy chat-qwen --no-verify-jwt
  ```

### Bloco 11: Widget Flutuante de Chat na Vitrine Pública
- [ ] Criar o componente visual do Chatbot flutuante no canto da tela (`ChatWidget.jsx`).
- [ ] Conectar requisição HTTP do chat diretamente à Edge Function (`supabase.functions.invoke('chat-qwen', { body: { message } })`).
- [ ] Testar perguntas capciosas para validar a recusa rígida do System Prompt.
