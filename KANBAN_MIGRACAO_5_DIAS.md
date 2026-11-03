# ⚡ Kanban Sprint de Final de Semana: Migração Supabase & Agente IA

> **Estratégia Intensiva para Sexta, Sábado e Domingo**  
> *Hospedagem:* GitHub Pages (100% Gratuito)  
> *Backend & Banco de Dados:* Supabase Free Tier (PostgreSQL + Auth + Edge Functions)  
> *Inteligência Artificial:* Qwen 2.5 Coder 32B-Instruct via Edge Function Serverless  
> *Status do Front-End React:* UI, UX, drafts de edição, ordenação e visualização já implementados e validados!

---

## 🎯 Visão Geral do Fim de Semana
Como a interface em React (Vite), os componentes de vitrine divididos em 3 sessões, o editor Markdown/Docs/PDF, o organizador visual e o simulador do agente já estão 100% construídos e testados, o trabalho deste final de semana é focado estritamente na **ativação do backend gratuito, segurança e deploy**.

```
[ Sexta-Feira à Noite ] ──► [ Sábado de Manhã ] ──► [ Sábado à Tarde ] ──► [ Domingo de Manhã ] ──► [ Domingo à Tarde ]
   Supabase & SQL DDL         SDK & Leituras (SELECT)     Auth & CRUD Admin      Edge Function Qwen       QA & GitHub Pages Deploy
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
  - [ ] Criação dos índices de performance e triggers de `updated_at`.
- [ ] Executar o script de **Row Level Security (RLS)**:
  - [ ] Habilitar RLS em todas as tabelas.
  - [ ] Garantir que o visitante (`anon`) possua **APENAS** permissão de `SELECT` onde `is_published = true`.
  - [ ] Garantir que escrita (`INSERT`, `UPDATE`, `DELETE`) exija token autenticado (`authenticated`).

### Bloco 3: Seed Inicial dos Dados
- [ ] Executar script de inserção inicial com os dados já existentes em [src/data/projectsData.js](file:///home/alomy/portfolio/src/data/projectsData.js) (AgentMetrics, U-Net Segmentation, Obsidian Neon, artigos e pensamentos) para que o banco já nasça populado.

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
- [x] Aba de pensamentos secundária integrada dentro da seção "Sobre Mim" ([src/components/About.jsx](file:///home/alomy/portfolio/src/components/About.jsx)).
- [ ] Substituir o estado inicial estático em `Projects.jsx` por chamada assíncrona:
  ```javascript
  const { data } = await supabase.from('works').select('*').eq('is_published', true).order('display_order', { ascending: true });
  ```
- [ ] Conectar `Articles.jsx` para buscar da tabela `articles`.
- [ ] Conectar gaveta de pensamentos em `About.jsx` para buscar da tabela `thoughts`.
- [ ] Conectar `ViewDraft.jsx` para carregar o projeto selecionado por `id` do Supabase.

---

## 📅 SÁBADO À TARDE: Autenticação & Operações de Escrita (Admin)
**Meta:** Permitir que Matheus crie, edite, exclua e reordene projetos e artigos na nuvem pelo painel.

### Bloco 6: Supabase Auth para o Administrador
- [ ] Habilitar autenticação por **Email/Senha** no painel do Supabase (**Authentication > Providers**).
- [ ] Criar o usuário administrador com seu e-mail pessoal.
- [ ] Criar modal ou tela de Login simples na rota `/4dm1n` solicitando login caso não haja sessão ativa (`supabase.auth.getSession()`).

### Bloco 7: Conexão de Salvamento e Ordem Real
- [x] Editor rico com atalhos Word/Obsidian, gaveta de metadados colapsável e leitor Google Docs/PDF ([src/components/AdminDraft.jsx](file:///home/alomy/portfolio/src/components/AdminDraft.jsx)).
- [x] Organizador de vitrine em cards com separação por tipo e botões de mover ([src/components/OrderDraft.jsx](file:///home/alomy/portfolio/src/components/OrderDraft.jsx)).
- [ ] Conectar botão "Salvar" de `AdminDraft.jsx` com `supabase.from('works').upsert(...)`.
- [ ] Conectar botão "Excluir" de `AdminDraft.jsx` com `supabase.from('works').delete().eq('id', id)`.
- [ ] Conectar botão "Publicar Nova Ordem" de `OrderDraft.jsx` para atualizar a coluna `display_order` no Supabase em batch.

---

## 📅 DOMINGO DE MANHÃ: Edge Function do Agente IA (Qwen 2.5)
**Meta:** Colocar o assistente virtual inteligente para responder dúvidas dos visitantes na nuvem de graça.

### Bloco 8: Deploy da Edge Function Serverless
- [x] Arquitetura desenhada e documentada ([ROADMAP_SUPABASE_SEGURANCA_IA.md](file:///home/alomy/portfolio/ROADMAP_SUPABASE_SEGURANCA_IA.md)).
- [x] System Prompt de produção blindado contra jailbreak e fora de escopo ([ROADMAP_SUPABASE_SEGURANCA_IA.md](file:///home/alomy/portfolio/ROADMAP_SUPABASE_SEGURANCA_IA.md)).
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

### Bloco 9: Integração do Chatbot no Portfólio
- [ ] Criar o widget flutuante de chat no canto inferior direito da tela pública (`ChatWidget.jsx`).
- [ ] Conectar a chamada de envio do visitante diretamente ao endpoint da Edge Function (`supabase.functions.invoke('chat-qwen', { body: { message } })`).
- [ ] Testar perguntas capciosas (ex: "faça uma redação", "como fazer um bolo") para validar a recusa rígida do System Prompt.

---

## 📅 DOMINGO À TARDE: QA, Build & Deploy no GitHub Pages
**Meta:** Portfólio dinâmico 100% publicado e acessível publicamente no GitHub Pages.

### Bloco 10: Auditoria e Build de Produção
- [x] Correção de sobreposição da topbar/header em todas as telas ([src/style.css](file:///home/alomy/portfolio/src/style.css)).
- [x] Headers de edição, organização e saber mais integrados e estáticos ([src/components/AdminDraft.css](file:///home/alomy/portfolio/src/components/AdminDraft.css), [src/components/OrderDraft.css](file:///home/alomy/portfolio/src/components/OrderDraft.css), [src/components/ViewDraft.css](file:///home/alomy/portfolio/src/components/ViewDraft.css)).
- [x] Redução do espaçamento entre as categorias na vitrine pública ([src/style.css](file:///home/alomy/portfolio/src/style.css)).
- [x] Link "Artigos" no menu principal e botões intuitivos de acesso ([src/components/HeadSite.jsx](file:///home/alomy/portfolio/src/components/HeadSite.jsx), [src/components/Perfil.jsx](file:///home/alomy/portfolio/src/components/Perfil.jsx), [src/components/Projects.jsx](file:///home/alomy/portfolio/src/components/Projects.jsx)).
- [ ] Rodar testes locais:
  ```bash
  npm run lint
  npm run build
  npm run preview
  ```

### Bloco 11: Deploy Gratuito no GitHub Pages
- [ ] Configurar o `vite.config.js` com `base: './'` para suportar caminhos relativos em qualquer domínio do GitHub Pages.
- [ ] Adicionar script de deploy no `package.json`:
  ```json
  "deploy": "vite build && gh-pages -d dist"
  ```
  *(Ou configurar GitHub Actions oficial para deploy automático na branch `main`)*.
- [ ] Testar o portfólio online:
  - Navegar pelas 3 sessões de projetos com filtros;
  - Acessar a seção de Artigos;
  - Abrir "Saber mais" e visualizar Markdown, Google Docs e PDF;
  - Abrir a aba secundária de Pensamentos em "Sobre Mim";
  - Conversar com o Agente de IA Qwen no chat.
