# Kanban: Migração JAMstack e Assistente IA (Plano de 5 Dias)

Este documento contém o escopo completo para ser importado/criado como Issues no GitHub Projects. O projeto visa evoluir o portfólio de estático para dinâmico utilizando React, Supabase e integração com IA (Qwen), com duração estimada de 5 dias.

## Estrutura do Kanban
Recomenda-se criar colunas: `To Do`, `In Progress`, `Review/Test`, `Done`.

---

## 📅 Dia 1: Otimização do Perfil, Supabase Auth e Banco de Dados

### Issue 1: Otimização e Governança no GitHub
- **Descrição Técnica:** Implementar boas práticas de controle de projeto e documentação no GitHub.
- **Tasks:**
  - [ ] Criar quadro no GitHub Projects (Kanban) e estruturar colunas.
  - [ ] Cadastrar as Issues principais do projeto com base neste documento.
  - [ ] Revisar e melhorar o `README.md` dos projetos principais do portfólio (adicionar documentação clara, arquitetura, badges e screenshots).
  - [ ] Mapear repositórios Open Source para futuras contribuições (Pull Requests).

### Issue 2: Configuração Inicial do Supabase e Banco de Dados
- **Descrição Técnica:** Criar o ambiente de backend-as-a-service utilizando PostgreSQL no Supabase.
- **Tasks:**
  - [ ] Criar novo projeto no Supabase.
  - [ ] Desenhar o esquema de dados e criar tabelas essenciais no Editor SQL do Supabase:
    - Tabela `posts` (id, title, slug, content, published_at).
    - Tabela `works` (id, title, description, category [personal/corporate], image_url, link).
    - Tabela `experiences` (id, company, role, period, description).
  - [ ] Configurar as políticas de segurança RLS (Row Level Security) permitindo leitura pública e escrita apenas para usuário autenticado.

### Issue 3: Configuração da Autenticação (Auth)
- **Descrição Técnica:** Configurar e garantir o acesso restrito ao painel administrativo.
- **Tasks:**
  - [ ] Configurar os provedores de Auth no Supabase (habilitar exclusivamente e-mail/senha específicos ou OAuth do GitHub pessoal).
  - [ ] Testar criação/login do usuário admin pelo painel do Supabase.

---

## 📅 Dia 2: Painel Administrativo em React (/admin) e Autenticação no Front

### Issue 4: Proteção de Rotas e Integração de Login
- **Descrição Técnica:** Configurar o front-end React para gerenciar sessão e bloquear acessos indevidos na rota de administração.
- **Tasks:**
  - [ ] Instalar o SDK do Supabase no projeto React (`@supabase/supabase-js`).
  - [ ] Configurar variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - [ ] Criar a rota `/admin`.
  - [ ] Implementar lógica de Private Route (Redirecionar para login caso o usuário não tenha sessão válida no Supabase).
  - [ ] Criar tela de Login (UI e integração com `supabase.auth.signInWithPassword` ou OAuth).

### Issue 5: CRUD de Artigos (Blog) no Painel
- **Descrição Técnica:** Criar o formulário que permitirá redigir e salvar os artigos no banco.
- **Tasks:**
  - [ ] Desenvolver a interface do formulário (Título, Slug, Conteúdo, Data).
  - [ ] Integrar biblioteca de edição Markdown (ex: `easymde` ou `react-markdown`).
  - [ ] Desenvolver a função de 'Submit' enviando o objeto para a tabela `posts` (via `.insert()` do Supabase).
  - [ ] Exibir lista simples (tabela) de artigos já criados dentro do admin para controle (edição/exclusão básica).

---

## 📅 Dia 3: Dinamismo das Seções do Portfólio (Works e Experiências)

### Issue 6: Refatoração da Seção "Works" (Projetos)
- **Descrição Técnica:** Migrar a listagem de projetos estáticos para o consumo da API do Supabase e categorizá-los.
- **Tasks:**
  - [ ] Popular a tabela `works` no Supabase com os dados atuais do portfólio.
  - [ ] No componente React da seção Works, criar requisição `fetch` com Supabase (`supabase.from('works').select('*')`).
  - [ ] Implementar lógica de separação visual/filtros entre 'Projetos Pessoais' e 'Empresas/Corporativos'.
  - [ ] Ajustar UI para renderizar os cards a partir do estado React (dados do banco).

### Issue 7: Refatoração da Seção "Experiências"
- **Descrição Técnica:** Tornar o currículo/histórico profissional atualizável pelo banco de dados.
- **Tasks:**
  - [ ] Popular a tabela `experiences` no Supabase com os dados estáticos.
  - [ ] No componente de Experiências, substituir dados mockados por chamada ao banco.
  - [ ] Garantir ordenação correta por data (mais recente primeiro).

---

## 📅 Dia 4: Blog Técnico Front-end e Polimento Visual (Modos de Tema)

### Issue 8: Listagem e Leitura de Artigos (Blog Dinâmico)
- **Descrição Técnica:** Construir o visual público onde visitantes leem os artigos gravados pelo Admin.
- **Tasks:**
  - [ ] Criar requisição à tabela `posts` no componente principal do Blog para listar cards (título, resumo, data).
  - [ ] Criar a rota de visualização do artigo completo (ex: `/blog/:slug`).
  - [ ] Buscar o conteúdo do artigo via slug e renderizá-lo na tela.
  - [ ] Converter o conteúdo Markdown salvo no banco para HTML seguro (usando `react-markdown` e plugins necessários).

### Issue 9: Controles de Tema e Personalização Visual (Josh Comeau Style)
- **Descrição Técnica:** Implementar suporte avançado a Dark/Light mode com micro-interações.
- **Tasks:**
  - [ ] Implementar sistema global de tema (Context API, Zustand ou configuração Tailwind/CSS Variables).
  - [ ] Desenvolver o botão (Toggle) de troca de tema no Header com animações suaves.
  - [ ] Definir e ajustar a paleta de cores para ambos os modos, focando em contraste e estética refinada.
  - [ ] Revisar transições de cores e efeitos hover em botões e cards de todo o site.

---

## 📅 Dia 5: Assistente Virtual IA (Qwen) e Deploy Final

### Issue 10: Setup Seguro do Assistente IA (Backend Serverless)
- **Descrição Técnica:** Isolar a chamada para a API do modelo Qwen em um ambiente seguro para proteger chaves e impor regras rígidas.
- **Tasks:**
  - [ ] Desenvolver uma Supabase Edge Function (ou API route se usar framework compatível) chamada `chat-qwen`.
  - [ ] Adicionar a API Key do modelo Qwen nos Secrets do Supabase.
  - [ ] Implementar a lógica na Edge Function: receber query, formatar o payload para a API do Qwen.
  - [ ] **Crucial:** Injetar no payload o *System Prompt* rígido (limitando contexto a dúvidas sobre seus projetos, currículo e artigos, proibindo geração de código ou conversas genéricas).

### Issue 11: Interface de Chat no Front-end
- **Descrição Técnica:** Criar a UI para o usuário interagir com o agente de IA.
- **Tasks:**
  - [ ] Construir o componente visual do Chatbot (janela fixa no canto da tela ou seção dedicada).
  - [ ] Implementar estados React para histórico de mensagens (user e bot) e estado de *loading*.
  - [ ] Fazer a requisição HTTP da interface para a Edge Function (`chat-qwen`).
  - [ ] Tratamento de erros e formatação da resposta no balão de chat.

### Issue 12: Revisão Final (QA) e Deploy
- **Descrição Técnica:** Garantir estabilidade e atualizar a versão de produção no GitHub Pages.
- **Tasks:**
  - [ ] Testar todas as funcionalidades (Admin logado vs não logado, filtros de works, navegação do blog, respostas da IA).
  - [ ] Validar responsividade e design em ambos os temas (Dark/Light).
  - [ ] Rodar processos de build local (`npm run build`).
  - [ ] Realizar commit final e enviar (push) para o repositório disparando o deploy para o GitHub Pages (via `gh-pages` ou GitHub Actions).
