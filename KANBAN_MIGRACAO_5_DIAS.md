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


### coisas para fazer:

arrumar o botão do artigo para visualizar mais detalhes
arrumar adicionar um botao de compartilhar em todas as abas: artigos, projetos, pensamentos,
arrumar visualemente o sistema de corriculos
arrumar botao de seta duplicada q o gemini fez errado
arrumar a resposta do agente
arrumar e gardiraios
arrumar o sistema do dashboard (finetunning)
puxar o idioma do proprio navegador de forma automatica
