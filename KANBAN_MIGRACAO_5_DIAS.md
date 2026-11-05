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

## 🔒 PRÓXIMA ATUALIZAÇÃO: Refatoração de Segurança & Zero Secrets no LocalStorage
**Meta:** Eliminar qualquer chave de API ou credencial do cliente/localStorage, isolando a inferência na nuvem Supabase.

### Bloco 12: Migração para Supabase Edge Function (`/chat-qwen`)
- [x] Criar a Edge Function `supabase/functions/chat-qwen/index.ts` com chamada segura à Groq API, injeção de contexto RAG e guardrails na nuvem.
- [ ] Salvar a secret no Supabase Cloud (Aguardando OK do usuário para deploy):
  ```bash
  npx supabase secrets set GROQ_API_KEY=sua-chave-aqui
  ```
- [ ] Fazer deploy da Edge Function na nuvem Supabase (Aguardando OK do usuário para deploy):
  ```bash
  npx supabase functions deploy chat-qwen
  ```
- [x] Atualizar `src/lib/llmService.js` para chamar `supabase.functions.invoke('chat-qwen', ...)` em vez de chamar diretamente a API da Groq no frontend.
- [x] Remover permanentemente quaisquer leituras ou fallbacks de chaves secretas no `localStorage` do navegador (removida codificação XOR estática e leituras de tokens locais).
- [x] Garantir que o `localStorage` armazene estritamente cache de dados públicos já exibidos e preferências visuais.


### ✅ Tarefas Concluídas nesta Sprint:

- [x] **Botão do Artigo para Detalhes:** Estilizado com padrão visual unificado `.link-arrow highlight` com seta animada `<span>→</span>`, links diretos para leitura em PT/EN e rota corrigida no `App.jsx` + `ViewDraft.jsx` para suportar refresh direto.
- [x] **Botão de Compartilhar:** Componente universal `ShareButton` implementado com suporte à Web Share API e fallback com feedback visual ("Copiado!") nas abas de Artigos, Projetos, Pensamentos e na tela de Detalhes (`ViewDraft`).
- [x] **Aba de Artigos com Dois Links (PT & EN):** Cadastre links do Google Docs independentes para Português e Inglês no painel Admin, com persistência retrocompatível via `BILINGUAL_SPLIT` e botões dedicados nos cards e no visualizador.
- [x] **Visual do Sistema de Currículos:** Ícones vetoriais SVG substituindo caixas vazias no Hero modal e no painel Admin (dropzones bilíngues EN/PT, cards do Google Docs e PDF, prévia ao vivo).
- [x] **Correção da Seta Duplicada:** Eliminado o caractere `← ` redundante nas chaves de tradução `view.back_to_projects` e `view.back_to_articles` que causava a renderização de setas duplicadas com a tag JSX.
- [x] **Formatação da Resposta do Agente:** Parser `FormattedMessage` no `ChatWidget` renderizando negrito (`**bold**`), código inline (`` `code` ``), links markdown/URLs com abertura segura em nova aba, listas com marcadores e quebras de linha limpas.
- [x] **Guardrails de Segurança (Anti-Injection & Escopo Fechado):** Validação de camada dupla (cliente em `llmService.js` e servidor em `supabase/functions/chat-qwen/index.ts`) interceptando tentativas de jailbreak, DAN mode, comandos bash/SQL e solicitações fora do escopo (receitas, piadas, clima) com recusa cordial padronizada.
- [x] **Dashboard de Fine-Tuning do Agente:** Painel completo no Admin com 4 Presets de Persona (Recrutador Técnico, Deep Learning & PyTorch, Backend & DevOps, Conciso & Direto), seletor de modelo Groq, sliders de Temperatura e Max Tokens, monitor de guardrails e simulador com botões de teste rápido e limpeza de histórico.
- [x] **Detecção Automática do Idioma do Navegador:** Suporte a `navigator.languages` e `navigator.language` no `languageState.js` priorizando Português para navegadores pt/pt-BR e Inglês para os demais, preservando escolha manual do usuário.

---

## 🚀 SPRINT ATUAL: REFINAMENTO DE UX, DRAG & DROP DE DESENHOS, GESTÃO DE CHAVES & TELAS DEDICADAS
**Status Geral:** Em execução (Passo a passo antes de cada modificação)

### 📌 Fila de Execução em Andamento:
- [x] **Passo 1:** Padronização de cores no modal de currículo (mesmo esquema dark/roxo/neon) e remoção da animação do pontinho verde no Alomyr.
- [x] **Passo 2:** Cadastro seguro de chaves de API e seleção dinâmica de modelos do agente diretamente pelo Dashboard (`agent_configs` e Edge Function).
- [x] **Passo 3:** Tela dedicada estilo "Saber Mais" para Pensamentos (leitura completa, anexo Google Docs/PDF e navegação).
- [x] **Passo 4:** Sistema de Drag & Drop para reordenar cards de desenhos na galeria/admin e salvar/publicar nova ordem.
- [x] **Passo 5:** Correção de redirecionamento no Admin: retorno da prévia direto para o `/4dm1n` e correção do login (remoção de `/#`).
- [x] **Passo 6:** Ícones minimalistas para categorias (Profissional, Acadêmico e Pessoal) seguindo a paleta do portfólio.
- [x] **Passo 7:** Botão de atalho rápido para Contatos / Redes Sociais ao lado do botão de Download do CV no Hero.
- [x] **Passo 8:** Redução das sugestões de perguntas do Alomyr para 3 perguntas de alto impacto para recrutadores.
- [x] **Passo 9:** Cores de ícones: Ubuntu em laranja oficial (`#E95420`) e Markdown em branco (`#FFFFFF`).
- [x] **Passo 10:** Novo card de destaque em Interesses (ao lado de Código & Café) com customização completa pelo Dashboard (título, texto e foto).
- [x] **Passo 11:** Refatoração dos botões Próximo/Anterior em telas de detalhes para setas minimalistas intuitivas.
- [x] **Passo 12:** Integração contextual do Alomyr nas telas de detalhes (Saber Mais de Projetos, Artigos e Pensamentos).
- [x] **Passo 13:** Tela 404 estilosa e temática seguindo a estética dark/cyber/lobo do portfólio.
- [x] **Passo 14:** Testes no localhost concluídos e relatório consolidado (pronto para validação do usuário; deploy aguardando comando `ok`).

---

## 🎨 SPRINT DE REFINAMENTOS DE UI & VITRINE DE DESENHOS (EM EXECUÇÃO)
**Status Geral:** Executando correções imediatas de UI e expansão da galeria/interesses

### 📌 Fila de Execução em Andamento:
- [x] **Passo 15:** Ícones de 'Baixar' e 'Abrir na Web' na cor roxa (`#a78bfa` / `#8b5cf6`) em todo o sistema.
- [x] **Passo 16:** Correção do hover das logos Ubuntu e Markdown (neutras/monocromáticas por padrão; cores oficiais ativadas apenas no hover).
- [x] **Passo 17:** Extensão da edição no Dashboard `/4dm1n` para **todos os cards de interesse** (7 cards personalizáveis: títulos, descrições, fotos e categorias).
- [x] **Passo 18:** Refinamento da vitrine pública de desenhos para visitantes (lightbox aprimorado com miniaturas, navegação suave, tags de hiper-realismo e alta resolução).

---

## 🚀 SPRINT EM ANDAMENTO: ECOSSISTEMA DE BLOG DUPLO (SPLIT GATEWAY)
**Status Geral:** Iniciado com autorização do usuário ("dale") - Executando passo a passo

### 📌 Fila de Execução em Andamento:
- [x] **Passo 19:** Estrutura de dados e persistência do Blog (`src/data/blogData.js` e `src/lib/supabaseService.js`) com canais `tech` e `alomyr`, suporte a tags livres, vídeos do YouTube e galerias de fotos.
- [x] **Passo 20:** Tela intermediária do Split Gateway (`/blog/?` e componente `BlogGateway.jsx`), portal imersivo com dois botões para escolha ativa de conteúdo.
- [x] **Passo 21:** Integração dos botões "Blog" na Navbar (`HeadSite.jsx`) e no Hero (`Perfil.jsx`) com links para o Split Gateway.
- [x] **Passo 22:** Página do Blog Técnico / Acadêmico (`/blog`), feed focado em IA, backend, arquitetura e pipelines.
- [x] **Passo 23:** Página do Laboratório Criativo & Geek (`/blog/alomyr`), feed dedicado a hiper-realismo, retrogaming, pensamentos e universo nerd.
- [x] **Passo 24:** Leitor detalhado de post do blog com embed de vídeos do YouTube, galeria de imagens e conexão forte bidirecional com projetos da home.
- [x] **Passo 25:** Módulo de gestão e moderação do Blog no Dashboard `/4dm1n` (criação de posts, seleção de canal, inserção de vídeos e fotos, moderação de tags).
- [x] **Passo 26:** Roteamento integrado no `App.jsx`, suporte a multi-páginas no `vite.config.js` e validação com `npm run build`.

### 🎯 Resultados da Sprint de Ecossistema de Blog Duplo:
- **Split Gateway (`/blog/?`):** Portal imersivo cyberpunk com dois caminhos distintos: *Blog de Engenharia & IA* (`/blog`) e *Laboratório Alomyr* (`/blog/alomyr`).
- **Navegação & Hero:** Botão "Blog" adicionado na Navbar principal e no Hero com efeitos de brilho e atalho direto ao Gateway.
- **Canal 1 - Engenharia & IA (`/blog`):** Feed técnico com filtros dinâmicos de tags (`#FastAPI`, `#PyTorch`, `#TimescaleDB`, etc.), busca em tempo real e posts com badges temáticos.
- **Canal 2 - Laboratório Alomyr (`/blog/alomyr`):** Feed criativo com tags geek (`#Hiper-realismo`, `#Retrogaming`, `#Marvel`, `#Filosofia`), reflexões e galerias.
- **Mídia Rica Integrada:** Suporte a vídeos do YouTube incorporados (player responsivo 16:9 via iframe) e galerias de fotos com lightbox em alta resolução.
- **Links Bidirecionais Fortes:** Cards de projetos na página inicial e no `ViewDraft` exibem link direto para o post correspondente no blog, e posts do blog contam com callout direto para o projeto no portfólio.
- **Dashboard `/4dm1n` (Aba Blog):** Painel administrativo completo para criação, edição, seleção de canal, upload de imagens (Supabase Storage), moderação de tags e exclusão de posts.
- **Build & Multi-page:** Entradas estáticas `blog/index.html` e `blog/alomyr/index.html` geradas no `vite.config.js` com compilação 100% limpa.
- **Deploy:** Bloqueado conforme diretriz mandatória. Aguardando teste local e comando **`ok`** do usuário.

---

## 🎨 SPRINT: REFINAMENTOS DE UI, SCROLL DO ADMIN, ESTILO EI NERD & REPO DO PORTFÓLIO
**Status Geral:** Iniciado - Executando passo a passo

### 📌 Fila de Execução em Andamento:
- [x] **Passo 27:** Correção do scroll da aba de editar o blog no `/4dm1n` e refinamento do fluxo de criação e postagem.
- [x] **Passo 28:** Ajuste da Navbar (mais altura/padding para respiro) e remoção do efeito de destaque excessivo no botão do Blog.
- [x] **Passo 29:** Layout das páginas de feed do Blog inspirado no portal *Ei Nerd* (Lead story/Destaque Hero + Grade de Notícias + Tags em Alta), mantendo estética dark/cyber do site.
- [x] **Passo 30:** Cadastro do repositório do portfólio (`https://github.com/Matheus-dCastro/portfolio`) nos Projetos Pessoais com print/preview no Saber Mais.
- [x] **Passo 31:** Aprimoramento do redimensionamento e responsividade do card integrado do Alomyr no Saber Mais (`ViewDraft`).
- [x] **Passo 32:** Atualização do `README.md` (arquitetura antes vs agora, Supabase, Edge Functions) e geração do relatório detalhado de impacto.

---

## 🏁 STATUS FINAL DA SPRINT: 100% CONCLUÍDO E HOMOLOGADO EM LOCALHOST
- Todos os 32 passos foram minuciosamente executados, testados via build de produção e documentados.
- Build do Vite executado com sucesso (0 erros).
- Servidor local ativo em `http://localhost:5173/`.
- **Deploy:** Bloqueado conforme diretriz mandatória. Aguardando a verificação no localhost e o comando **`ok`** do usuário.
