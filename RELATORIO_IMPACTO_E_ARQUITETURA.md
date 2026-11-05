# 📋 Relatório Executivo de Arquitetura, Refatorações e Impacto no Uso
**Projeto:** Portfólio Oficial, Ecossistema de Blog Duplo & Agente IA — Matheus de Castro  
**Branch de Desenvolvimento:** `refatoring-securit`  
**Data:** 05 de Novembro de 2026  
**Autor:** Antigravity / Matheus de Castro (Alomyr)  

---

## 1. Resumo Executivo

Este documento consolida todas as intervenções de engenharia de software, refatoração de segurança, design de produto e arquitetura de nuvem implementadas na plataforma **matheusdecastro.com**.

O objetivo principal desta sprint foi transformar um portfólio estático com persistência volátil e credenciais no cliente em uma **plataforma moderna, segura e desacoplada**, incorporando um ecossistema de blog duplo, inferência de Inteligência Artificial serverless na nuvem e design editorial de alto padrão inspirado no portal *Ei Nerd*.

---

## 2. Detalhamento de Todas as Modificações Implementadas

### A. Segurança & Zero Secrets no LocalStorage (Bloco 12)
* **Supabase Edge Function (`/chat-qwen`):** Foi desenvolvida a função serverless em Deno/TypeScript (`supabase/functions/chat-qwen/index.ts`), atuando como proxy seguro de inferência neural para o modelo Qwen 2.5 32B Coder via API da Groq.
* **Cofre em Nuvem:** A chave `GROQ_API_KEY` foi movida integralmente para as variáveis de ambiente protegidas do Supabase Cloud (`supabase secrets set`).
* **Frontend Descontaminado:** O arquivo `src/lib/llmService.js` foi reescrito para invocar `supabase.functions.invoke('chat-qwen')`. Foram eliminadas todas as leituras, fallbacks e persistências de chaves no `localStorage` do navegador.

### B. Ecossistema de Blog Duplo & Split Gateway (`/blog/?`)
* **Camada de Dados Centralizada (`src/data/blogData.js`):** Criação das estruturas de canais (`tech` e `alomyr`), tags dinâmicas, cálculo de tempo de leitura e sincronização com o Supabase.
* **Gateway Intermediário (`src/components/BlogGateway.jsx`):** Tela imersiva em estilo cyberpunk onde o visitante escolhe ativamente qual faceta deseja explorar:
  1. **Blog de Engenharia & IA (`/blog`):** Voltado a artigos aprofundados sobre Machine Learning, visão computacional, pipelines assíncronos e backend.
  2. **Laboratório Alomyr (`/blog/alomyr`):** Espaço para hiper-realismo em grafite, cultura geek/nerd, retrogaming e configurações Linux.
* **Mídias Ricas & Links Bidirecionais:** Player responsivo 16:9 para vídeos do YouTube incorporados, galeria de fotos com lightbox em alta definição e botões que conectam os artigos do blog aos projetos do portfólio (e vice-versa).

### C. Layout Editorial Inspirado no Portal *Ei Nerd*
* **Manchete Principal / Lead Story (Destaque Hero):** O primeiro post do feed é exibido em um card widescreen panorâmico com cover de alta resolução, gradiente cinematográfico, badge de destaque (`⚡ MANCHETE PRINCIPAL`), título de grande impacto, metadados do autor, tempo de leitura e botão de ação direta.
* **Barra de Tópicos em Alta ("🔥 EM ALTA"):** Faixa horizontal com ícone de chama animada exibindo as tags mais quentes do canal com contagem de matérias e filtro instantâneo por clique.
* **Grid Editorial Secundário:** Grade responsiva (3 colunas em desktop, 2 em tablet e 1 em mobile) com cards contendo badges de mídias (Vídeo, Galeria de Fotos, Projeto Vinculado) e botão de compartilhamento.

### D. Cadastro do Repositório do Portfólio nos Projetos Pessoais
* **Projeto Cadastrado (`id: "portfolio-ecosystem"`):** Inserido em `DEFAULT_PROJECTS` dentro de `src/data/projectsData.js` na categoria **Pessoal**.
* **Documentação Técnica & Print no Saber Mais:** Inclui explicação completa da arquitetura do portfólio e renderização de imagem estática (`/portfolio-preview.png`) suportada nativamente pelo parser Markdown do `ViewDraft.jsx`.
* **Sincronização com Cache:** A função `getStoredProjects()` foi atualizada para mesclar automaticamente novos projetos padrão mesmo se o visitante tiver um cache anterior no navegador.

### E. Painel Administrativo (`/4dm1n`) & Correção de Scroll
* **Desbloqueio de Scroll:** Correção do container `.admin-editor-layout` e `.blog-admin-container`, restaurando a rolagem vertical completa no painel de moderação do blog e no reordenador de desenhos.
* **Fluxo de Edição Intuitivo:** O formulário de edição do blog foi reestruturado em seções numeradas limpas (1. Canal & Visibilidade, 2. Títulos e Resumos, 3. Categorização e Vínculo com Projetos, 4. Mídia Rica, 5. Conteúdo Markdown), com barra superior fixa contendo o botão "Salvar Post ✓".

### F. Responsividade e Redimensionamento do Card do Alomyr no Saber Mais
* **Alinhamento e Largura:** `.view-alomyr-contextual-section` expandido para largura total da coluna de leitura (`max-width: 100%`).
* **Estrutura Flexível do Formulário:** Os botões de envio e abertura de chat foram agrupados em `.alomyr-form-buttons`, garantindo que o campo de texto preencha o espaço sem quebrar linhas de forma assimétrica em telas intermediárias (tablets e laptops).
* **Adaptação Mobile:** Em smartphones (<= 768px), o formulário se reorganiza verticalmente e os botões se expandem com 50% de largura cada na linha inferior.

### G. Refinamentos Visuais de UI & Navbar
* **Mais Respiro na Navbar:** Aumento do padding vertical e topo da barra de navegação principal (`header.site-header` e `.blog-navbar`), trazendo mais elegância e espaçamento entre o topo da viewport e o conteúdo.
* **Remoção do Efeito de Destaque Excessivo no Botão do Blog:** O botão "Blog" na Navbar e no Hero agora adota o mesmo esquema refinado e discreto dos demais botões, mantendo o padrão visual sem poluição luminosa.
* **Hover Corrigido nos Ícones de Ubuntu e Markdown:** O ícone do Ubuntu permanece neutro e ganha tom laranja no hover; o ícone do Markdown permanece neutro e ganha tom branco no hover.
* **Ícones de Download e Web Roxo:** Padronização cromática dos botões de ação do currículo e links externos.
* **Deteção Automática do Idioma:** Leitura de `navigator.languages` no primeiro acesso para servir o site em Português ou Inglês conforme o navegador do usuário.

---

## 3. Comparativo de Arquitetura: Antes vs. Agora

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ARQUITETURA ANTERIOR                             │
│                                                                             │
│  [Browser do Visitante]                                                     │
│     │                                                                       │
│     ├─► localStorage: Chaves de API (Groq), dados voláteis                  │
│     ├─► Chamada Direta de API: Browser ──► Groq API (Inseguro)              │
│     └─► Navegação: Apenas SPA simples (F5 em sub-rota dava erro 404)        │
└─────────────────────────────────────────────────────────────────────────────┘

                                      ▼
                                  EVOLUÇÃO
                                      ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                           NOVA ARQUITETURA ATUAL                            │
│                                                                             │
│  [Browser do Visitante]                                                     │
│     │ (Zero Secrets, apenas cache visual público)                           │
│     │                                                                       │
│     ├─► CDN GitHub Pages (matheusdecastro.com)                              │
│     │     • HTML Multi-page estático (Vite)                                 │
│     │     • Split Gateway (/blog/?), Tech (/blog), Lab (/blog/alomyr)       │
│     │                                                                       │
│     ├─► Supabase Cloud Database (PostgreSQL REST)                           │
│     │     • Tabelas 'blog_posts' e 'projects' sincronizadas em tempo real   │
│     │     • Bucket de Storage para imagens de alta resolução                │
│     │                                                                       │
│     └─► Supabase Cloud Edge Function Serverless (/chat-qwen)                │
│           • Chave GROQ_API_KEY isolada no cofre de Secrets em nuvem         │
│           • Modelo Qwen 2.5 32B Coder com Guardrails e RAG Contextual       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Comparativo de Hospedagem & Serviços: Pages vs. Supabase

| Recurso | GitHub Pages (Frontend) | Supabase Cloud (Backend & IA) | Como se Complementam |
| :--- | :--- | :--- | :--- |
| **Função Principal** | Servir o cliente web estático compilado (HTML, CSS, JS, Imagens públicas). | Prover banco relacional (PostgreSQL), Storage de mídia e execução serverless de IA. | O Pages garante carregamento ultrarrápido globalmente, enquanto o Supabase cuida da inteligência e persistência. |
| **Custo & Escalabilidade** | Gratuito, tráfego distribuído por CDN mundial sem limite de requisições estáticas. | Plano Free do Supabase acomoda milhares de execuções de Edge Functions e banco em nuvem. | Arquitetura de custo operacional zero para o volume atual de visitas e consultas. |
| **Segurança** | Código 100% público no repositório. Zero credenciais salvas no bundle. | Cofre de Secrets criptografadas (`GROQ_API_KEY`) e controle de acesso via RLS. | Elimina o risco de alguém inspecionar o código-fonte no DevTools e roubar chaves de IA. |
| **Roteamento de Subpáginas** | Suportado nativamente pelas entradas multi-page estáticas geradas pelo Vite. | APIs REST prontas com URLs determinísticas para consultas e mutações. | Permite que o usuário dê F5 em `/blog`, `/blog/alomyr` ou `/4dm1n` sem tela de 404. |

---

## 5. Impacto Prático no Uso

### Para o Visitante Comum & Recrutadores Técnicos
1. **Primeira Impressão Imediata:** Ao acessar de outros países, o site já carrega em inglês nativo; se acessar do Brasil, carrega em português sem necessidade de clicar no botão de idioma.
2. **Experiência de Conteúdo Superior:** O design estilo *Ei Nerd* torna a leitura de artigos técnicos e postagens do laboratório visualmente estimulante, destacando vídeos explicativos e fotos em lightbox.
3. **Assistente Inteligente Útil:** Em vez de fazer perguntas genéricas, o visitante pode usar o Alomyr diretamente dentro da tela do projeto para tirar dúvidas sobre a stack ("Como foi configurada a U-Net neste projeto?").
4. **URLs Limpas e Compartilháveis:** Cada post do blog e cada projeto possui um botão de compartilhamento que copia o link direto com parâmetros limpos.

### Para Matheus de Castro (Administrador / Desenvolvedor)
1. **Autonomia Total de Postagens:** É possível publicar artigos técnicos, vídeos ou desenhos diretamente pelo `/4dm1n` sem precisar abrir o VS Code, fazer commit e aguardar build do GitHub Actions.
2. **Segurança e Tranquilidade:** As chaves de API nunca mais serão expostas no GitHub nem no navegador.
3. **Separação de Contextos:** Clareza entre o que é produção de engenharia/IA séria (no `/blog`) e o que é arte/geek/pessoal (no `/blog/alomyr`).
4. **Organização Visual Intuitiva:** O novo layout do admin permite visualizar e editar qualquer post com facilidade e rolagem suave.

---

## 6. Estado Atual & Procedimento de Deploy

* **Branch Atual:** `refatoring-securit`
* **Testes de Build:** Compilação do Vite executada com sucesso (`✓ built in 491ms`, 0 erros).
* **Ambiente Local:** Servidor ativo em `http://localhost:5173/` pronto para homologação.
* **Status do Deploy:** Conforme regra estrita do projeto, **nenhum deploy em produção (GitHub Pages ou Supabase Edge Functions) foi disparado**.
* **Próximo Passo:** Aguardando o comando explícito **`ok`** do usuário após testar localmente para proceder com a publicação.
