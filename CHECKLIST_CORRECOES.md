# Checklist de Correções e Refinamentos - Matheus de Castro Portfolio

Este documento registra o checklist completo de diagnóstico, correções executadas e validações realizadas para o painel de administração e para a experiência dos visitantes.

---

## 📋 Resumo das Frentes de Trabalho Concluídas

- [x] **Frente 0: Arquitetura, Banco de Dados (Supabase) & Resiliência**
  - [x] Criação do script SQL completo em `supabase/migrations/20261111_full_system_sync.sql` contendo:
    - [x] Tabela `public.hobbies` com RLS e políticas de leitura pública e escrita autenticada.
    - [x] Tabela `public.profile_configs` com RLS para persistência da foto de perfil no Supabase.
    - [x] Tabela `public.blog_posts` com RLS e índices de canal e publicação.
    - [x] Colunas `custom_hobby_json` e `blog_gateway_config` na tabela `public.agent_configs`.
    - [x] Criação e políticas de acesso para os buckets de Storage `documents` e `images`.
  - [x] Implementação de camada resiliente e híbrida em `src/lib/supabaseService.js`:
    - [x] Fallback automático para Data URLs seguras caso o Storage ainda não tenha os buckets criados, garantindo que o upload **nunca quebre nem trave a aplicação**.
    - [x] Redundância dupla de gravação e leitura (tabelas dedicadas + fallback de contingência).

- [x] **Frente 1: Aba Interesses & Cards de Hobbies (Admin & Visitante)**
  - [x] Removida a trava determinística em `src/data/projectsData.js` (`DEFAULT_HOBBIES_LIST.map(...)`) que impedia adicionar novos cards ou excluir cards.
  - [x] Implementado CRUD completo no Admin (`src/components/AdminDraft.jsx`):
    - [x] Botão **`+ Novo Card`**: cria novos cards de interesse dinamicamente com IDs únicos.
    - [x] Botão **`🗑️ Excluir Este Card`**: remove cards via `removeHobby` com confirmação.
    - [x] Seletor de layout visual: `Padrão (1x1)`, `Destaque Alto (tall)`, `Destaque Largo (wide)` e `Estilo Especial (custom-hobby-card)`.
    - [x] Upload de foto do card via `uploadHobbyImage` com feedback e fallback.
    - [x] Edição bilíngue completa (Títulos PT/EN, Descrições PT/EN, Categoria).
    - [x] Botão de salvar todos os cards sincronizando no Supabase e no localStorage.
  - [x] No visitante (`src/components/Interecese.jsx` e `src/Hobbies.jsx`):
    - [x] Consumo dinâmico de todos os cards cadastrados (sem limitação arbitrária de 7 cards).
    - [x] Tratamento de fallback de imagem (`onError`) para garantir visual sempre limpo.
    - [x] Suporte ao layout especial `.custom-hobby-card` adicionado ao CSS.

- [x] **Frente 2: Upload de PDF e Atualização da Foto de Perfil (Admin & Visitante)**
  - [x] **Upload de PDF do Currículo (`uploadCvPdf`)**:
    - [x] Suporte a envio para Storage Supabase (buckets `documents` ou `images`).
    - [x] Fallback transparente para Data URL persistente que não depende de sessão local, salvando diretamente na tabela `cv_configs` e no localStorage.
    - [x] Suporte bilíngue mantendo os dois PDFs (PT e EN) sincronizados.
  - [x] **Foto de Perfil**:
    - [x] Corrigidas as funções `fetchProfileConfig` e `persistProfileConfig` em `src/lib/supabaseService.js` para persistir e recuperar do banco Supabase em nuvem.
    - [x] Upload em `uploadProfileImage` com fallback resiliente.
    - [x] Atualização global e reativa da foto em todas as páginas e componentes:
      - [x] Hero da página inicial (`Home.jsx` e `Perfil.jsx`).
      - [x] Página de contatos e redes (`Links.jsx`).
      - [x] Leitor de matérias do blog (`BlogPage.jsx`).
      - [x] Painel administrativo com prévia imediata (`AdminDraft.jsx`).
  - [x] **Modal de Currículo (`Perfil.jsx`)**:
    - [x] Baixa e abre os PDFs atualizados tanto em português quanto em inglês sem quebras.

- [x] **Frente 3: Sistema de Blog & Conexão com Banco de Dados**
  - [x] Conexão bidirecional completa com o banco Supabase (`fetchBlogPosts`, `persistBlogPost`, `removeBlogPost`, `uploadBlogImage`).
  - [x] Edição, exclusão e criação de posts nos dois canais (`tech` e `alomyr`) funcionando com persistência.
  - [x] **Gestão da URL `/blog/?` e Gateway via Admin**:
    - [x] Criado painel no Admin para configurar o comportamento da rota `https://matheusdecastro.com/blog/?`.
    - [x] Configuração da rota padrão (`gateway`, `tech` ou `alomyr`).
    - [x] Edição de Título e Subtítulo do Gateway (PT e EN).
    - [x] Controle de visibilidade e texto do Banner de Aviso/WIP (PT e EN).
    - [x] Persistência em nuvem via `persistBlogGatewayConfig`.

- [x] **Frente 4: Estética & Design do Blog no Estilo do Portfólio (Menos IA)**
  - [x] Removidos gradientes genéricos cianos e layouts estilo SaaS corporativo IA.
  - [x] Aplicado o sistema estelar cósmico de 10 camadas de estrelas oficial do portfólio (`#030306`) no Gateway (`BlogGateway.css`) e no Blog (`BlogPage.css`).
  - [x] Cartões com vidro escuro (`#0f0f15`), bordas violeta neon (`#8b5cf6`), tipografia Inter elegante e badges refinados.
  - [x] Consistência visual entre `/`, `/hobbies`, `/blog`, `/blog/alomyr` e `/blog/?`.

- [x] **Frente 5: Responsividade Mobile/Tablet & Bloco Alomyr em "Saiba Mais"**
  - [x] **Bloco do Alomyr em `ViewDraft.jsx` ("Saiba mais")**:
    - [x] Substituída a seção complexa que quebrava telas menores pelo padrão idêntico do banner `.linked-item-banner bottom-highlight` (o mesmo comando de "Artigo Completo no Blog").
    - [x] Layout flexível que adapta avatar, textos e botão sem estourar a largura da tela.
  - [x] **Responsividade Mobile & Tablet**:
    - [x] Media queries refinadas para `.linked-item-banner` em celulares (`<= 768px`).
    - [x] Gateway de blog com empilhamento vertical suave em telas menores (`<= 900px` e `<= 480px`).
    - [x] Grade de hobbies com 2 colunas em tablets (641px - 1024px) e 1 coluna em celulares (`<= 640px`).
    - [x] Teste de compilação de produção (`npm run build`) validado com sucesso (zero erros).
