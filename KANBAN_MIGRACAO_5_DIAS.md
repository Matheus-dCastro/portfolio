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

## 🚀 PROPOSTA DE ARQUITETURA: ECOSSISTEMA DE BLOG DUPLO (SPLIT GATEWAY)
**Status:** Avaliação técnica elaborada (Aguardando comando **"go"** do usuário para iniciar codificação)

### 📐 Estrutura Planejada:
- [ ] **Split Gateway Intermediário (`/blog/?`):** Tela de escolha entre os dois ecossistemas com botões imersivos no Hero e na Navbar.
- [ ] **Vertente 1: Blog Acadêmico / Profissional (`/blog`):** Engenharia de IA, Backend, arquitetura corporativa e pipelines de projetos.
- [ ] **Vertente 2: Laboratório Criativo & Geek (`/blog/alomyr/`):** Hiper-realismo, retrogaming, ensaios reflexivos (pensamentos) e setups.
- [ ] **Formatos Ricos:** Suporte a vídeos incorporados do YouTube, galerias de imagens e Markdown dinâmico.
- [ ] **Integração Bidirecional:** Cards de projetos da home com atalho direto para os posts detalhados e vice-versa.
- [ ] **Gestão Unificada no `/4dm1n`:** Aba administrativa para criação, moderação e categorização com canais específicos.

---
