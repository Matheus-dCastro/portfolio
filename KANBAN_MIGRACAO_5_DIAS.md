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

### 💡 Próximas Sugestões de Melhorias:
1. **Streaming SSE no Chatbot:** Implementar Server-Sent Events na Edge Function para exibir a digitação de tokens em tempo real (efeito typewriter fluido).
2. **Rate Limiting por IP na Edge Function:** Adicionar controle de taxa (ex: 20 requisições/hora por IP) no Supabase ou Upstash Redis para prevenir abuso de cotas gratuitas da Groq.
3. **Analytics Anônimo de Perguntas:** Registrar tópicos mais consultados pelos recrutadores no assistente para guiar novos artigos e projetos destacados.
4. **Exportação de Relatórios de Acesso em PDF:** Gerar resumo analítico dos projetos mais visualizados para o administrador.
