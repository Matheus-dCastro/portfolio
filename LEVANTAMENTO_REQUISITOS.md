# Levantamento de Requisitos: Refatoração JAMstack e Integração de IA

Conforme solicitado, este documento apresenta o levantamento de requisitos detalhado, a lista de etapas de implementação e a avaliação dos processos e ideias para a migração do portfólio (matheusdecastro.com) para uma arquitetura dinâmica com Supabase e IA (Qwen). **Nenhum código foi implementado ou configurado nesta etapa**, apenas a documentação detalhada.

---

## 1. Avaliação dos Processos e Ideias

A proposta de transição de um site puramente estático (atualmente no GitHub Pages) para uma arquitetura JAMstack utilizando Supabase é excelente e altamente recomendada para o nível de escala desejado.

**Pontos Fortes da Arquitetura Escolhida:**
- **Supabase (PostgreSQL + Auth + APIs):** Substituir atualizações manuais no código por um banco de dados relacional e APIs prontas (Supabase) reduzirá drasticamente o atrito de publicação de novos artigos e projetos. A funcionalidade de Auth nativa facilita a criação de rotas protegidas.
- **Painel Administrativo Customizado:** Criar um painel em React (ex: `/admin`) oferece flexibilidade total no gerenciamento do conteúdo (blog, works, experiências) usando bibliotecas de Markdown (como `easymde` ou `react-markdown`), sem depender de CMSs engessados.
- **Assistente de IA (Qwen) + Edge Functions:** Utilizar Edge Functions para mascarar e proteger a chave da API do modelo Qwen é uma prática de segurança obrigatória e correta. O modelo atuará com um escopo fechado (template rígido), baseado nos dados do portfólio, garantindo respostas focadas e úteis para os visitantes.
- **Integração Visual (Estilo Josh Comeau):** Manter o foco no design refinado (Dark/Light mode, efeitos) assegura que a modernização da infraestrutura não prejudique a experiência do usuário.

**Consideração de Hospedagem:**
Como o site atualmente está no GitHub Pages, rotas dinâmicas ou SPAs com `react-router` podem enfrentar problemas de "404 Not Found" ao acessar URLs diretamente. A criação de rotas como `/admin` precisará ser gerenciada ou pelo roteador multi-page do Vite (já em uso no projeto) ou através de um redirecionamento customizado no `404.html` caso se use roteamento no lado do cliente.

---

## 2. Levantamento de Requisitos (Requisitos Funcionais e Não Funcionais)

### 2.1 Requisitos Funcionais (RF)
* **RF01 - Autenticação e Autorização:** O sistema deve possuir uma rota de administração protegida (`/admin`), acessível apenas pelo administrador, utilizando login via e-mail/senha ou GitHub através do Supabase Auth.
* **RF02 - Gestão de Artigos (Blog):** O painel administrativo deve permitir a criação, edição, leitura e deleção (CRUD) de artigos, suportando formatação via Markdown.
* **RF03 - Exibição Dinâmica do Blog:** A aplicação principal deve buscar (via requisição à API do Supabase) e listar os artigos publicados, permitindo a leitura individual de cada um.
* **RF04 - Gestão de Projetos (Works):** O sistema deve categorizar e gerenciar projetos (Pessoais vs. Empresas/Corporativos) dinamicamente pelo banco de dados.
* **RF05 - Gestão de Experiências:** O sistema deve listar as experiências profissionais consumindo os dados diretamente do banco, permitindo atualização via painel admin.
* **RF06 - Chatbot de IA:** A aplicação deve possuir uma interface de chat no front-end para responder a dúvidas sobre os projetos/artigos.
* **RF07 - Respostas da IA contextualizadas:** O agente (Qwen) deve usar um *system prompt* rígido, limitando-se a responder com base no contexto do portfólio.
* **RF08 - Controles de Tema:** A aplicação deve fornecer uma alternância nativa de Dark/Light mode com ajustes refinados.

### 2.2 Requisitos Não Funcionais (RNF)
* **RNF01 - Segurança da API de IA:** As chamadas para a API do modelo Qwen devem ser feitas via Edge Function (ou API Serverless) para não expor as chaves de API no front-end.
* **RNF02 - Desempenho e Arquitetura:** A aplicação deve adotar arquitetura JAMstack, utilizando React no front-end e Supabase no back-end.
* **RNF03 - Base de Dados:** O sistema utilizará PostgreSQL (gerenciado pelo Supabase).

---

## 3. Lista Detalhada de Etapas para Implementação

Com base nas atividades mapeadas (Otimização do GitHub, Configuração Supabase, Painel Admin, Seções Dinâmicas, IA e Tema), a implementação deve seguir as seguintes etapas em ordem cronológica:

### Etapa 1: Otimização e Padronização do GitHub
1. Mapear os repositórios principais do portfólio.
2. Escrever documentação clara (arquivos `README.md`) com descrições, tecnologias, instruções de execução e capturas de tela.
3. Configurar quadros do GitHub Projects e Issues para rastrear o progresso e o backlog de tarefas.
4. Identificar repositórios open-source para futuras contribuições (Pull Requests).

### Etapa 2: Setup da Infraestrutura (Supabase)
1. Criar um projeto no Supabase.
2. Configurar o banco de dados PostgreSQL criando as tabelas necessárias:
   - `posts` (id, title, slug, content, published_at)
   - `works` (id, title, description, category, link, image_url)
   - `experiences` (id, role, company, period, description)
3. Configurar o Supabase Auth para habilitar autenticação via GitHub e/ou provedor de E-mail (restringindo a criação de usuários).
4. Configurar as políticas de Row Level Security (RLS) no Supabase (Leitura pública; Escrita/Atualização/Deleção apenas para o usuário autenticado/admin).

### Etapa 3: Desenvolvimento do Painel Administrativo em React
1. Criar a rota/página `/admin` no front-end em React.
2. Implementar o fluxo de login consumindo o Supabase Auth.
3. Proteger a rota para redirecionar usuários não autenticados.
4. Desenvolver o formulário de criação/edição de posts do blog integrando uma biblioteca (ex: `easymde` ou `react-markdown`).
5. Criar funções utilitárias no React para enviar os dados dos formulários (Posts, Works, Experiências) via API do Supabase (operações de INSERT, UPDATE e DELETE).

### Etapa 4: Refatoração das Seções do Portfólio (Frontend)
1. **Blog Técnico:** Modificar a seção de artigos para realizar um `fetch` (ou usar o cliente Supabase) na tabela `posts` e renderizar as listagens e as páginas de leitura dinamicamente.
2. **Works Dinâmica:** Refatorar o componente de Works para consumir a tabela `works`, criando filtros na UI para separar claramente "Pessoais" de "Empresas/Corporativos".
3. **Experiências:** Refatorar o componente de Experiências para consumir a tabela `experiences`.

### Etapa 5: Assistente de IA com Qwen
1. Desenvolver uma Supabase Edge Function (ou outra infraestrutura serverless aplicável).
2. Na Edge Function, instanciar o cliente da API do modelo Qwen armazenando a chave de API de forma segura (como variável de ambiente).
3. Elaborar o *system prompt* rígido, alimentando a IA com informações do portfólio (resumo das experiências e projetos).
4. No front-end (React), construir o componente visual do Chat (input de texto, janela de mensagens, botões de ação).
5. Conectar o componente de Chat à Edge Function, gerenciando os estados de carregamento e exibição de respostas.

### Etapa 6: Refinamento Visual e Polimento
1. Implementar o sistema de tema (Dark/Light mode) seguindo as referências visuais de Josh Comeau.
2. Adicionar micro-interações, efeitos de transição e animações aos componentes.
3. Testar todas as rotas e funcionalidades (especialmente o modo leitura de artigos e o painel de admin) em dispositivos móveis e desktop.
4. Fazer o *build* de produção e realizar o deploy atualizado.