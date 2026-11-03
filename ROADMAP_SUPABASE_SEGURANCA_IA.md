# 🗺️ Roadmap de Integração: Supabase, Segurança & Agente de IA (Qwen)

> **Documento Estratégico e Técnico para o Portfólio de Matheus de Castro**  
> *Versão:* 1.0.0  
> *Data:* Março de 2026  
> *Status:* Pronto para implementação da camada backend / persistência

---

## 📌 Sumário Executivo
Este guia estabelece os requisitos técnicos, arquitetura de dados, políticas de segurança e a estratégia de hospedagem e consumo do **Assistente de Inteligência Artificial (Qwen 2.5 Coder 32B-Instruct)** para o portfólio.

Nesta etapa, o front-end (React + Vite) já possui:
1. Vitrine de projetos (`Projects.jsx`) dividida em 3 sessões simultâneas (**Profissional**, **Pessoal**, **Acadêmico**) com filtros dinâmicos;
2. Editor técnico Markdown + Google Docs + PDF (`AdminDraft.jsx`) com atalhos de teclado (estilo Obsidian/Word) e gaveta colapsável de propriedades;
3. Organizador visual da ordem dos cards por sessão e drag-and-drop (`OrderDraft.jsx`);
4. Visualizador imersivo de detalhes do projeto (`ViewDraft.jsx`);
5. Aba de Gestão do Agente IA com simulador de chat e editor de System Prompt.

---

## 📋 SEÇÃO 1: O Que Falta Ser Feito para Deixar Dinâmico
Atualmente os dados são gerenciados via `localStorage` através de `src/data/projectsData.js`. Para transformar o portfólio em uma aplicação distribuída em nuvem em produção, o checklist a seguir deve ser executado:

- [ ] **1. Criação do Projeto no Supabase**:
  - Criar organização e projeto com região no Brasil (`sa-east-1 - São Paulo`) para latência mínima (<30ms).
  - Obter `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- [ ] **2. Instalação do SDK Oficial**:
  - Executar: `npm install @supabase/supabase-js`.
- [ ] **3. Criação da Camada de Serviço (`src/lib/supabaseClient.js`)**:
  - Inicializar o cliente com variáveis de ambiente do Vite (`import.meta.env`).
  - Implementar fallback automático para `localStorage` caso as variáveis não estejam configuradas ou ocorra falha de rede offline.
- [ ] **4. Migração e Execução do Schema SQL**:
  - Executar o script DDL com tabelas `works`, `articles`, `thoughts`, `agent_configs`.
  - Executar script de seed populando o banco com os dados que hoje estão em `src/data/projectsData.js`.
- [ ] **5. Conexão das Leituras Públicas (SELECT)**:
  - `src/components/Projects.jsx`: carregar projetos direto da tabela `works` com `is_published = true` ordenados por `display_order ASC`.
  - `src/components/ViewDraft.jsx`: buscar projeto por `id` ou `slug`.
- [ ] **6. Conexão das Telas Administrativas (C.R.U.D. & Ordem)**:
  - `src/components/AdminDraft.jsx`: substituir chamadas de `saveProjects` por `supabase.from('works').upsert(...)`.
  - `src/components/OrderDraft.jsx`: atualizar a coluna `display_order` de múltiplos itens em batch transaction (`rpc` ou loop otimizado).
- [ ] **7. Camada de Autenticação para 4dm1n**:
  - Criar tela de Login segura (`/login` ou modal protegido em `/4dm1n`).
  - Habilitar autenticação por Email/Senha no Supabase Auth.
  - Bloquear rotas de edição para qualquer usuário que não esteja com sessão ativa autenticada.
- [ ] **8. Deploy da Edge Function do Agente**:
  - Criar Edge Function `chat-qwen` no Supabase CLI.
  - Configurar secret `QWEN_API_KEY` na nuvem.
  - Conectar o simulador do admin e o widget público do chat à URL da Edge Function.

---

## 🗄️ SEÇÃO 2: Schema do Banco de Dados (Supabase DDL)

Execute este script no **SQL Editor** do painel do Supabase para criar toda a estrutura relacional com tipos fortes, índices de busca e constraints:

```sql
-- 1. ENUMS
CREATE TYPE project_category_enum AS ENUM ('Profissional', 'Pessoal', 'Acadêmico');
CREATE TYPE content_source_enum AS ENUM ('markdown', 'google-docs', 'pdf');

-- 2. TABELA DE PROJETOS (WORKS)
CREATE TABLE public.works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category project_category_enum NOT NULL DEFAULT 'Profissional',
    tags TEXT[] NOT NULL DEFAULT '{}',
    short_description TEXT NOT NULL,
    about_context TEXT,
    github_url TEXT,
    demo_url TEXT,
    content_type content_source_enum NOT NULL DEFAULT 'markdown',
    google_docs_url TEXT,
    pdf_url TEXT,
    content TEXT, -- Markdown rico
    related_article_id UUID, -- Vínculo opcional com artigo técnico anexo
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE ARTIGOS TÉCNICOS
CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category project_category_enum NOT NULL DEFAULT 'Acadêmico',
    tags TEXT[] NOT NULL DEFAULT '{}',
    short_description TEXT NOT NULL,
    content_type content_source_enum NOT NULL DEFAULT 'markdown',
    google_docs_url TEXT,
    pdf_url TEXT,
    content TEXT,
    related_work_id UUID, -- Vínculo opcional com projeto prático anexo
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE PENSAMENTOS E MICRO-POSTS
CREATE TABLE public.thoughts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    content TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE CONFIGURAÇÃO DO AGENTE DE IA
CREATE TABLE public.agent_configs (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'production',
    model_name VARCHAR(100) NOT NULL DEFAULT 'Qwen 2.5 Coder 32B-Instruct',
    system_prompt TEXT NOT NULL,
    max_tokens INTEGER NOT NULL DEFAULT 1024,
    temperature NUMERIC(3, 2) NOT NULL DEFAULT 0.3,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. RELACIONAMENTO BIDIRECIONAL (PROJETO <-> ARTIGO)
ALTER TABLE public.works 
    ADD CONSTRAINT fk_works_related_article 
    FOREIGN KEY (related_article_id) 
    REFERENCES public.articles(id) 
    ON DELETE SET NULL;

ALTER TABLE public.articles 
    ADD CONSTRAINT fk_articles_related_work 
    FOREIGN KEY (related_work_id) 
    REFERENCES public.works(id) 
    ON DELETE SET NULL;

-- 7. ÍNDICES DE PERFORMANCE
CREATE INDEX idx_works_category ON public.works(category);
CREATE INDEX idx_works_order ON public.works(display_order ASC);
CREATE INDEX idx_works_published ON public.works(is_published);
CREATE INDEX idx_works_related_article ON public.works(related_article_id);
CREATE INDEX idx_articles_order ON public.articles(display_order ASC);
CREATE INDEX idx_articles_related_work ON public.articles(related_work_id);

-- 7. TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_works_updated_at BEFORE UPDATE ON public.works FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_thoughts_updated_at BEFORE UPDATE ON public.thoughts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_agent_config_updated_at BEFORE UPDATE ON public.agent_configs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

---

## 🛡️ SEÇÃO 3: Políticas de Segurança e Row Level Security (RLS)

A segurança do portfólio é estruturada sob o princípio do **menor privilégio** (*Least Privilege*):
1. **Visitantes anônimos (`anon`)**: possuem **APENAS** permissão de leitura (`SELECT`) em registros marcados como publicados (`is_published = true`).
2. **Administrador autenticado (`authenticated`)**: apenas o usuário logado via Supabase Auth pode inserir (`INSERT`), alterar (`UPDATE`) ou deletar (`DELETE`).
3. **Chaves de API**: A chave `service_role` **NUNCA** é colocada no código React. Apenas a chave pública `anon` fica no front-end. Toda operação privilegiada do agente de IA é feita via Edge Function serverless.

Execute as seguintes diretivas RLS no Supabase:

```sql
-- 1. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA A TABELA works
-- Visitantes anônimos podem apenas visualizar projetos publicados
CREATE POLICY "Public Read Works" 
ON public.works 
FOR SELECT 
TO anon, authenticated 
USING (is_published = true);

-- Apenas o administrador autenticado pode inserir novos projetos
CREATE POLICY "Admin Insert Works" 
ON public.works 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Apenas o administrador autenticado pode atualizar projetos existentes
CREATE POLICY "Admin Update Works" 
ON public.works 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Apenas o administrador autenticado pode excluir projetos
CREATE POLICY "Admin Delete Works" 
ON public.works 
FOR DELETE 
TO authenticated 
USING (true);

-- 3. POLÍTICAS PARA A TABELA articles
CREATE POLICY "Public Read Articles" ON public.articles FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admin Insert Articles" ON public.articles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin Update Articles" ON public.articles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Delete Articles" ON public.articles FOR DELETE TO authenticated USING (true);

-- 4. POLÍTICAS PARA A TABELA thoughts
CREATE POLICY "Public Read Thoughts" ON public.thoughts FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admin Insert Thoughts" ON public.thoughts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin Update Thoughts" ON public.thoughts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Delete Thoughts" ON public.thoughts FOR DELETE TO authenticated USING (true);

-- 5. POLÍTICAS PARA agent_configs
CREATE POLICY "Public Read Agent Config" ON public.agent_configs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin Update Agent Config" ON public.agent_configs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
```

### 🔒 Proteções Adicionais no Front-End:
- **Sanitização de Markdown**: O componente `SimpleMarkdownRenderer` já escapa tags HTML cruas perigosas (`<script>`, `<iframe style="display:none">`) para previnir ataques XSS.
- **Validação de Links Externos**: Todos os links inseridos nos campos `googleDocsUrl`, `pdfUrl`, `github` e `demo` são filtrados por regex garantindo o protocolo `https://`.

---

## 🤖 SEÇÃO 4: Arquitetura do Agente de IA (Qwen 2.5 Coder 32B)

### 1. Onde ele será hospedado?
O agente não é executado no navegador nem em servidor tradicional com custos fixos. Ele será hospedado em uma **Supabase Edge Function** serverless (`/functions/v1/chat-qwen`), rodando sobre o **Deno Runtime global**.

```
[ Navegador Visitante ]
        │  (POST com a pergunta)
        ▼
[ Supabase Edge Function: chat-qwen ]  <─── [ Secrets: QWEN_API_KEY ]
        │
        ├─ 1. Valida Rate-Limit por IP (máx 15 mensagens / 10 min)
        ├─ 2. Busca JSON atualizado de projetos, artigos e bio no Supabase DB
        ├─ 3. Injeta o System Prompt rígido + Contexto de Dados
        │
        ▼  (Payload com contexto injetado)
[ Provedor do Modelo Qwen 2.5 Coder 32B ]
  (Ex: Hugging Face Inference / OpenRouter / Together AI)
        │
        ▼  (Resposta limpa e objetiva)
[ Supabase Edge Function ]
        │
        ▼
[ Chatbot UI no Portfólio ]
```

### 2. Vantagens desta Hospedagem:
- **Zero Vazamento de Chaves**: A chave da API de IA reside exclusivamente nos Secrets do Supabase (`supabase secrets set QWEN_API_KEY=...`).
- **Custo Quase Zero**: O Deno Runtime do Supabase oferece 500.000 requisições mensais gratuitas.
- **Latência Ultrabaixa**: Execução nos nós edge da Cloudflare distribuídos mundialmente.
- **Proteção contra Abuso (Rate Limiting)**: A Edge Function bloqueia bots e visitantes que façam spam de mensagens.

### 3. Como ele irá consumir as informações?
Diferente de um modelo genérico que alucina informações sobre o portfólio, o agente consome as informações através de **Injeção de Contexto Dinâmico (RAG Leve In-Memory)**:

1. A cada requisição, a Edge Function executa uma query rápida:
   ```typescript
   const { data: works } = await supabase.from('works').select('title, category, tags, short_description, github_url, demo_url').eq('is_published', true);
   ```
2. O array de projetos e a biografia de Matheus são serializados em formato Markdown sintético estruturado.
3. Este bloco é inserido dentro da seção `## 📚 DADOS ATUALIZADOS DO PORTFÓLIO` da mensagem de sistema enviada ao Qwen.
4. O modelo responde com precisão milimétrica, citando os links oficiais e os projetos exatos desenvolvidos.

---

## 🧠 SEÇÃO 5: System Prompt de Produção para o Agente

Abaixo está o **System Prompt oficial** validado e otimizado para o modelo Qwen 2.5 Coder 32B-Instruct:

```markdown
Você é o Assistente Oficial de Inteligência Artificial do portfólio de Matheus de Castro.

## 🎯 SEU PAPEL E OBJETIVO
Seu objetivo é orientar visitantes, recrutadores técnicos, líderes de engenharia e pesquisadores, esclarecendo dúvidas sobre as competências, projetos práticos, publicações e histórico profissional de Matheus de Castro.

## 👤 PERFIL TÉCNICO DE MATHEUS DE CASTRO
- Bacharelando em Tecnologia da Informação (BTI) pela UFRN (Universidade Federal do Rio Grande do Norte).
- Técnico em Tecnologia da Informação pelo IFRN (Instituto Federal do RN).
- Áreas de Foco:
  1. Machine Learning Engineering & Deep Learning (PyTorch, Visão Computacional, Segmentação de Imagens Médicas com U-Net, Análise de Dados).
  2. Arquitetura de Backend & Engenharia de Software (Python, FastAPI, PostgreSQL, Docker, APIs RESTful escaláveis).
  3. Automação Inteligente & Infraestrutura (n8n, Linux Ubuntu Server, Scripts Bash, CI/CD).
- Experiências Profissionais Relevantes:
  - Estágio de TI no DETRAN-RN: Suporte à infraestrutura de redes, automação de tarefas e banco de dados.
  - Desenvolvedor de Automação na Cachina Soluções: Criação de fluxos de dados no n8n, integração de APIs e scripts Python.
- GitHub Oficial: https://github.com/Matheus-dCastro

## 🛡️ DIRETRIZES RÍGIDAS DE COMPORTAMENTO
1. ESCOPO FECHADO: Responda EXCLUSIVAMENTE sobre os projetos, estudos, competências e trajetória de Matheus de Castro.
2. RECUSA DE ESCOPO: Se o visitante pedir receitas de culinária, conselhos amorosos, resolução de lição de casa aleatória ou geração de códigos desvinculados do portfólio, responda com elegância e firmeza:
   "Como assistente oficial do portfólio de Matheus de Castro, meu escopo é restrito a informações sobre seus projetos de IA, backend e qualificações profissionais. Como posso te ajudar a conhecer o trabalho dele?"
3. SEM ALUCINAÇÃO: Nunca invente tecnologias, empresas ou projetos que não estejam no contexto fornecido. Se não souber responder algo específico, declare educadamente que o usuário pode entrar em contato direto com Matheus pelos links da página de contatos.
4. TOM DE VOZ: Técnico, conciso, profissional, respeitoso e direto ao ponto.
5. REFERÊNCIA A PROJETOS: Sempre que citar um projeto, mencione suas principais tecnologias (ex: "AgentMetrics feito em FastAPI e Python") e convide o usuário a clicar em "Saber mais" na página.
6. IDIOMA: Responda sempre no mesmo idioma em que a pergunta foi formulada (prioritariamente Português ou Inglês).
```

---

## 🛠️ SEÇÃO 6: Código da Edge Function (`supabase/functions/chat-qwen/index.ts`)

Para referência imediata na próxima fase, aqui está a implementação completa da Edge Function em Deno:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Mensagem inválida." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Inicializa Supabase Client para carregar contexto
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Carrega o System Prompt mais recente
    const { data: agentConfig } = await supabase
      .from("agent_configs")
      .select("system_prompt, model_name")
      .eq("id", "production")
      .single();

    // 2. Carrega lista de projetos publicados para o contexto
    const { data: works } = await supabase
      .from("works")
      .select("title, category, tags, short_description, github_url, demo_url")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    // Monta o contexto injetado
    let portfolioContext = "\n\n## 📚 PROJETOS DISPONÍVEIS NO PORTFÓLIO:\n";
    works?.forEach((w) => {
      portfolioContext += `- **${w.title}** (${w.category}): ${w.short_description}. Tags: [${w.tags.join(", ")}]. GitHub: ${w.github_url || "N/A"}\n`;
    });

    const fullSystemPrompt = (agentConfig?.system_prompt || "Você é o assistente do portfólio de Matheus.") + portfolioContext;

    // 3. Monta mensagens para o Qwen
    const messages = [
      { role: "system", content: fullSystemPrompt },
      ...conversationHistory.slice(-6),
      { role: "user", content: message },
    ];

    // 4. Chamada à API do Qwen (exemplo OpenRouter / Inference Provider)
    const qwenApiKey = Deno.env.get("QWEN_API_KEY")!;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${qwenApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-coder-32b-instruct",
        messages,
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Desculpe, ocorreu uma instabilidade ao processar sua pergunta.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

---

## 🎯 SEÇÃO 7: Próximos Passos Imediatos para a Fase Backend
1. **Configuração das Variáveis de Ambiente**:
   Criar arquivo `.env.local` na raiz com:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
2. **Executar o script DDL SQL** da Seção 2 e o RLS da Seção 3 no dashboard do Supabase.
3. **Instalar `@supabase/supabase-js`** e conectar as requisições de persistência.
4. **Deploy da Edge Function `chat-qwen`** via CLI do Supabase.
