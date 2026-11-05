-- ==============================================================================
-- SCHEMA SUPABASE: PORTFÓLIO & SISTEMA DE SEGURANÇA (RLS) - MATHEUS DE CASTRO
-- ==============================================================================
-- Instruções de Execução:
-- 1. Abra o painel do seu projeto no Supabase (https://supabase.com/dashboard)
-- 2. No menu lateral esquerdo, clique no ícone "SQL Editor"
-- 3. Clique em "+ New query", cole todo este código e clique em "Run" (ou Ctrl+Enter)
-- 4. Todas as tabelas, índices, triggers, regras de segurança RLS e projetos serão criados/atualizados automaticamente!
-- ==============================================================================

-- 1. ENUMS TIPADOS
DO $$ BEGIN
    CREATE TYPE project_category_enum AS ENUM ('Profissional', 'Pessoal', 'Acadêmico');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_source_enum AS ENUM ('markdown', 'google-docs', 'pdf');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELA DE PROJETOS (WORKS)
CREATE TABLE IF NOT EXISTS public.works (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
    content TEXT,
    related_article_id TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE ARTIGOS TÉCNICOS
CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    category project_category_enum NOT NULL DEFAULT 'Acadêmico',
    tags TEXT[] NOT NULL DEFAULT '{}',
    short_description TEXT NOT NULL,
    about_context TEXT,
    content_type content_source_enum NOT NULL DEFAULT 'markdown',
    google_docs_url TEXT,
    pdf_url TEXT,
    content TEXT,
    related_work_id TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE PENSAMENTOS E MICRO-POSTS
CREATE TABLE IF NOT EXISTS public.thoughts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    category project_category_enum NOT NULL DEFAULT 'Pessoal',
    tags TEXT[] NOT NULL DEFAULT '{}',
    short_description TEXT,
    about_context TEXT,
    content_type content_source_enum NOT NULL DEFAULT 'markdown',
    google_docs_url TEXT,
    pdf_url TEXT,
    content TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE CONFIGURAÇÃO DE CV (DUAL-MODE)
CREATE TABLE IF NOT EXISTS public.cv_configs (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'production',
    google_docs_url TEXT,
    pdf_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE CONFIGURAÇÃO DO AGENTE DE IA
CREATE TABLE IF NOT EXISTS public.agent_configs (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'production',
    model_name VARCHAR(100) NOT NULL DEFAULT 'Qwen 2.5 Coder 32B-Instruct',
    system_prompt TEXT NOT NULL,
    max_tokens INTEGER NOT NULL DEFAULT 1024,
    temperature NUMERIC(3, 2) NOT NULL DEFAULT 0.3,
    groq_api_key TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.agent_configs ADD COLUMN IF NOT EXISTS groq_api_key TEXT;
ALTER TABLE public.agent_configs ADD COLUMN IF NOT EXISTS custom_hobby_json JSONB;

-- 7. RELACIONAMENTO BIDIRECIONAL (PROJETO <-> ARTIGO)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_works_related_article') THEN
        ALTER TABLE public.works 
            ADD CONSTRAINT fk_works_related_article 
            FOREIGN KEY (related_article_id) 
            REFERENCES public.articles(id) 
            ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_articles_related_work') THEN
        ALTER TABLE public.articles 
            ADD CONSTRAINT fk_articles_related_work 
            FOREIGN KEY (related_work_id) 
            REFERENCES public.works(id) 
            ON DELETE SET NULL;
    END IF;
END $$;

-- 8. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_works_category ON public.works(category);
CREATE INDEX IF NOT EXISTS idx_works_order ON public.works(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_works_published ON public.works(is_published);
CREATE INDEX IF NOT EXISTS idx_works_related_article ON public.works(related_article_id);
CREATE INDEX IF NOT EXISTS idx_articles_order ON public.articles(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_related_work ON public.articles(related_work_id);
CREATE INDEX IF NOT EXISTS idx_thoughts_order ON public.thoughts(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_thoughts_published ON public.thoughts(is_published);

-- 9. TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_works_updated_at ON public.works;
CREATE TRIGGER trg_works_updated_at BEFORE UPDATE ON public.works FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_articles_updated_at ON public.articles;
CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_thoughts_updated_at ON public.thoughts;
CREATE TRIGGER trg_thoughts_updated_at BEFORE UPDATE ON public.thoughts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_cv_config_updated_at ON public.cv_configs;
CREATE TRIGGER trg_cv_config_updated_at BEFORE UPDATE ON public.cv_configs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trg_agent_config_updated_at ON public.agent_configs;
CREATE TRIGGER trg_agent_config_updated_at BEFORE UPDATE ON public.agent_configs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==============================================================================
-- 🛡️ POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
-- Regra de Ouro:
-- 1. Visitantes Anônimos ('anon'): podem apenas LER registros marcados como publicados (is_published = true).
-- 2. Administrador Autenticado ('authenticated'): possui controle total (SELECT, INSERT, UPDATE, DELETE).
-- 3. Nenhuma chave Service Role exposta no frontend.

ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;

-- WORKS POLICIES
DROP POLICY IF EXISTS "Public Read Works" ON public.works;
CREATE POLICY "Public Read Works" ON public.works
    FOR SELECT TO anon, authenticated
    USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Insert Works" ON public.works;
CREATE POLICY "Admin Insert Works" ON public.works
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update Works" ON public.works;
CREATE POLICY "Admin Update Works" ON public.works
    FOR UPDATE TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete Works" ON public.works;
CREATE POLICY "Admin Delete Works" ON public.works
    FOR DELETE TO authenticated
    USING (auth.role() = 'authenticated');

-- ARTICLES POLICIES
DROP POLICY IF EXISTS "Public Read Articles" ON public.articles;
CREATE POLICY "Public Read Articles" ON public.articles
    FOR SELECT TO anon, authenticated
    USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Insert Articles" ON public.articles;
CREATE POLICY "Admin Insert Articles" ON public.articles
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update Articles" ON public.articles;
CREATE POLICY "Admin Update Articles" ON public.articles
    FOR UPDATE TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete Articles" ON public.articles;
CREATE POLICY "Admin Delete Articles" ON public.articles
    FOR DELETE TO authenticated
    USING (auth.role() = 'authenticated');

-- THOUGHTS POLICIES
DROP POLICY IF EXISTS "Public Read Thoughts" ON public.thoughts;
CREATE POLICY "Public Read Thoughts" ON public.thoughts
    FOR SELECT TO anon, authenticated
    USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Insert Thoughts" ON public.thoughts;
CREATE POLICY "Admin Insert Thoughts" ON public.thoughts
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update Thoughts" ON public.thoughts;
CREATE POLICY "Admin Update Thoughts" ON public.thoughts
    FOR UPDATE TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete Thoughts" ON public.thoughts;
CREATE POLICY "Admin Delete Thoughts" ON public.thoughts
    FOR DELETE TO authenticated
    USING (auth.role() = 'authenticated');

-- CV_CONFIGS POLICIES
DROP POLICY IF EXISTS "Public Read CV Config" ON public.cv_configs;
CREATE POLICY "Public Read CV Config" ON public.cv_configs
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin Manage CV Config" ON public.cv_configs;
CREATE POLICY "Admin Manage CV Config" ON public.cv_configs
    FOR ALL TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- AGENT_CONFIGS POLICIES
DROP POLICY IF EXISTS "Public Read Agent Config" ON public.agent_configs;
CREATE POLICY "Public Read Agent Config" ON public.agent_configs
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin Manage Agent Config" ON public.agent_configs;
CREATE POLICY "Admin Manage Agent Config" ON public.agent_configs
    FOR ALL TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ==============================================================================
-- 🔑 PERMISSÕES DE ACESSO (GRANTS PARA AS ROLES DO SUPABASE)
-- ==============================================================================
-- O RLS controla as linhas, mas o PostgreSQL precisa conceder acesso base às tabelas:
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;

-- ==============================================================================
-- 🌱 SEED DATA: POPULANDO COM OS PROJETOS REAIS DE MATHEUS DE CASTRO
-- ==============================================================================

-- 1. ARTIGOS TÉCNICOS (Inseridos primeiro para possibilitar chave estrangeira)
INSERT INTO public.articles (
    id, title, category, tags, short_description, about_context,
    content_type, google_docs_url, pdf_url, content, display_order, is_published
) VALUES 
(
    'art-1',
    'Otimização de Inferência em Modelos de Linguagem na Borda',
    'Acadêmico',
    ARRAY['LLM', 'Quantização', 'Edge Computing', 'IA'],
    'Análise comparativa entre quantizações 4-bit (AWQ vs GGUF) executadas em hardware de consumo.',
    'Estudo sobre viabilidade e redução de latência no deploy de modelos de ponta em servidores locais.',
    'google-docs',
    'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    '',
    '# Otimização de Inferência em Modelos de Linguagem na Borda\n\nEste artigo encontra-se sincronizado com o documento no Google Docs. Caso deseje editar o conteúdo original, basta alterar no Google Docs.\n\n> O documento pode ser lido abaixo pelo leitor integrado ou acessado externamente.',
    0,
    true
),
(
    'art-2',
    'Segmentação U-Net Aplicada a Tomografias Pulmonares',
    'Acadêmico',
    ARRAY['Deep Learning', 'Visão Computacional', 'Artigo'],
    'Relatório de experimentos com funções de perda combinadas (Dice + Focal Loss).',
    'Artigo científico detalhando o processo experimental de treinamento supervisionado em imagens biomédicas.',
    'pdf',
    '',
    '/Matheus Vinicius Silva Freire de Castro.pdf',
    '# Segmentação U-Net Aplicada a Tomografias Pulmonares\n\nArtigo publicado com diagramas de arquitetura, curvas de convergência e métricas detalhadas.',
    1,
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    short_description = EXCLUDED.short_description,
    about_context = EXCLUDED.about_context,
    content_type = EXCLUDED.content_type,
    google_docs_url = EXCLUDED.google_docs_url,
    pdf_url = EXCLUDED.pdf_url,
    content = EXCLUDED.content,
    display_order = EXCLUDED.display_order,
    is_published = EXCLUDED.is_published;

-- 2. PROJETOS (WORKS)
INSERT INTO public.works (
    id, title, category, tags, short_description, about_context,
    github_url, demo_url, content_type, google_docs_url, pdf_url,
    content, related_article_id, display_order, is_published
) VALUES 
(
    'agentmetrics',
    'AgentMetrics',
    'Profissional',
    ARRAY['FastAPI', 'Data & ML', 'Python', 'Docker'],
    'API de telemetria inteligente desenvolvida para monitorar o consumo de recursos e metrificar o desempenho de agentes de IA em tempo real.',
    'Sistema de monitoramento e telemetria para LLMs e agentes autônomos. Coleta métricas de latência, consumo de tokens, custo por requisição e vazão de inferência em clusters de IA.',
    'https://github.com/Matheus-dCastro/AgentMetrics',
    '',
    'markdown',
    '',
    '',
    '# AgentMetrics: Telemetria de Agentes Autônomos de IA\n\nUma solução robusta de telemetria e observabilidade desenvolvida para monitorar agentes baseados em LLMs em ambientes de produção.\n\n## 🎯 Problema & Visão Geral\nÀ medida que agentes de inteligência artificial são integrados a rotinas corporativas, torna-se crítico rastrear o consumo de tokens, os tempos de inferência e a assertividade das respostas. O AgentMetrics resolve isso com uma arquitetura assíncrona orientada a eventos.\n\n## 🛠️ Arquitetura e Tecnologias\n- **FastAPI (Python 3.11):** Backend de alta performance com endpoints assíncronos (`async/await`).\n- **PostgreSQL & TimescaleDB:** Armazenamento otimizado para séries temporais de métricas.\n- **Docker & Docker Compose:** Conteinerização de todos os serviços para reprodutibilidade.\n- **Pydantic v2:** Validação estrita de contratos de dados em tempo de execução.',
    'art-1',
    0,
    true
),
(
    'medical-segmentation',
    'Medical Image Segmentation',
    'Acadêmico',
    ARRAY['Deep Learning', 'Python', 'PyTorch', 'U-Net'],
    'Pipeline de Deep Learning supervisionado para segmentação pixel a pixel de estruturas e lesões em imagens médicas utilizando arquitetura U-Net.',
    'Pesquisa acadêmica e aplicação prática de redes convolucionais e arquitetura U-Net para segmentação semântica de exames de tomografia e ressonância magnética.',
    'https://github.com/Matheus-dCastro/Projeto-de-AM-Supervisionado',
    '',
    'markdown',
    '',
    '',
    '# Medical Image Segmentation com Arquitetura U-Net\n\nProjeto de Aprendizado de Máquina Supervisionado focado na segmentação precisa de patologias em imagens de diagnóstico por imagem.\n\n## 🔬 Metodologia e Fundamentação\nA segmentação semântica no domínio médico requer alta sensibilidade e especificidade. Utilizamos uma rede neural convolucional com conexões de salto (*skip connections*) baseada na consagrada arquitetura U-Net.\n\n## 💻 Tecnologias\n- Python 3.10\n- PyTorch & Torchvision\n- Albumentations para Data Augmentation\n- OpenCV & Matplotlib',
    'art-2',
    1,
    true
),
(
    'obsidian-neon-theme',
    'Obsidian Neon Theme',
    'Pessoal',
    ARRAY['VS Code Theme', 'UI & Design', 'JSON', 'Design System'],
    'Tema e suíte visual para VS Code com paletas neon de alto contraste, ícones customizados e realce de sintaxe semântico refinado.',
    'Extensão publicada no Visual Studio Code Marketplace projetada com ergonomia visual para programadores que passam longas horas codificando em ambientes de baixa luminosidade.',
    'https://github.com/Matheus-dCastro/obsidian-neon-thema',
    'https://marketplace.visualstudio.com/items?itemName=Alomyr.obsidian-neon-110',
    'markdown',
    '',
    '',
    '# Obsidian Neon Theme para Visual Studio Code\n\nTema com estética cyberpunk refinada, focado em alta legibilidade sem fadiga visual para sessões noturnas de código.\n\n## 🎨 Filosofia de Design\nInspirado na precisão do traço do hiper-realismo e no contraste dinâmico de interfaces neons, o Obsidian Neon equilibra tons escuros profundos (#030306 e #08080c) com acentos violetas luminosos e ciano elétrico.',
    NULL,
    2,
    true
),
(
    'cachina-solucoes',
    'Cachina Soluções',
    'Profissional',
    ARRAY['Automation & Web', 'n8n', 'Linux', 'Bash'],
    'Desenvolvimento e hospedagem do ecossistema de interfaces e apresentação estratégica corporativa.',
    'Plataforma corporativa e automação de processos inteligentes implementada para a empresa Cachina Soluções.',
    'https://github.com/Matheus-dCastro/Site-Cachina-2026',
    'https://cachina.com.br/',
    'markdown',
    '',
    '',
    '# Cachina Soluções: Ecossistema Digital & Automação\n\nProjeto corporativo abrangendo a arquitetura de apresentação institucional, automação de processos e gestão de infraestrutura em nuvem.\n\n## 💼 Escopo do Trabalho\n- Implementação de fluxos de integração contínua e automação com **n8n**.\n- Configuração e sustentação de servidores dedicados Linux (Ubuntu Server).\n- Criação da interface web institucional com carregamento ultra rápido e SEO otimizado.\n- Integração de formulários de captação e disparos via webhooks corporativos.',
    NULL,
    3,
    true
),
(
    'task-system-cli',
    'Task System CLI',
    'Pessoal',
    ARRAY['Python & SQL', 'PostgreSQL', 'MVC', 'CLI'],
    'Arquitetura MVC completa com persistência em PostgreSQL para controle eficiente de fluxos de trabalho via terminal.',
    'Aplicativo CLI desenvolvido em Python seguindo rigorosamente os padrões de projeto MVC com persistência relacional.',
    'https://github.com/Matheus-dCastro/Sistema-de-Controle-em-Py3',
    '',
    'markdown',
    '',
    '',
    '# Task System CLI: Gestão Produtiva no Terminal\n\nFerramenta CLI para gerenciamento ágil de tarefas e auditoria de atividades com banco de dados PostgreSQL.\n\n## 🏛️ Padrão Arquitetural\nAdotou-se o modelo MVC (Model-View-Controller):\n- **Model:** Entidades de domínio mapeadas com validação e conexões seguras ao banco de dados relacional.\n- **View:** Interface de linha de comando com menus interativos e saída tabulada colorida.\n- **Controller:** Orquestrador das regras de negócio, bloqueios de concorrência e transações atômicas ACID.',
    NULL,
    4,
    true
),
(
    'timemaster',
    'TimeMaster',
    'Acadêmico',
    ARRAY['Java', 'OOP', 'LP2', 'Design Patterns'],
    'Sistema modular backend para gerenciamento de compromissos e agendamentos complexos desenvolvido em LP2.',
    'Projeto acadêmico de Linguagem de Programação 2 explorando programação orientada a objetos pura, padrões de projeto e tratamento robusto de exceções.',
    'https://github.com/Matheus-dCastro/Sistema-de-Agenda-de-Compromissos.git',
    '',
    'markdown',
    '',
    '',
    '# TimeMaster: Gestão de Agendamentos em Java\n\nArquitetura modular em Java com classes imutáveis para cálculo de intervalos de tempo e resolução automática de conflitos em calendários.',
    NULL,
    5,
    true
),
(
    'zombie-dice',
    'Zombie Dice',
    'Acadêmico',
    ARRAY['C++', 'OOP', 'State Machine', 'CLI Game'],
    'Implementação orientada a objetos e máquina de estados para execução de jogo de dados lógico via terminal CLI.',
    'Jogo de estratégia probabilística implementado em C++ com gerenciamento manual de memória e máquina de estados finitos.',
    'https://github.com/Matheus-dCastro/trabalho-06-projeto-zombie-dice-Turma-DIM0176---PROGRAMA-O-I---T02-2025.1-.git',
    '',
    'markdown',
    '',
    '',
    '# Zombie Dice em C++ Moderno\n\nImplementação completa das regras do jogo com simulação estatística de probabilidades de rolagem e inteligência para decisão de parada (Push Your Luck).',
    NULL,
    6,
    true
),
(
    'projeto-snaze',
    'Projeto snaze',
    'Acadêmico',
    ARRAY['Game in CPP', 'C++', 'Algorithms', 'Pathfinding'],
    'Simulação computacional onde o programa guia uma serpente inteligente através de um labirinto até o alimento com algoritmos de busca.',
    'Trabalho acadêmico de Programação I envolvendo representação de grafos, matrizes esparsas e busca em largura (BFS).',
    'https://github.com/Matheus-dCastro/trabalho-07-projeto-snaze--Turma-DIM0176---PROGRAMA-O-I---T02-2025.1-.git',
    '',
    'markdown',
    '',
    '',
    '# Projeto Snaze: IA de Busca em Labirinto\n\nAlgoritmo de navegação autônoma em labirintos dinâmicos utilizando estruturas de fila e matrizes de adjacência.',
    NULL,
    7,
    true
),
(
    'password-generator',
    'Password Generator',
    'Pessoal',
    ARRAY['CPP', 'Security', 'Entropy', 'CLI'],
    'Gerador determinístico e estocástico de senhas de alta entropia com validação de complexidade e tamanho configurável.',
    'Ferramenta de segurança em C++ focada em geração segura de chaves criptográficas e senhas resistentes a ataques de dicionário.',
    'https://github.com/Matheus-dCastro/trabalho-03-projeto-passgen-Turma-DIM0176---PROGRAMA-O-I---T02-2025.1-',
    '',
    'markdown',
    '',
    '',
    '# Password Generator em C++\n\nUtilitário criptográfico para geração de senhas e passphrases com cálculo em tempo real de bits de entropia de Shannon.',
    NULL,
    8,
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    short_description = EXCLUDED.short_description,
    about_context = EXCLUDED.about_context,
    github_url = EXCLUDED.github_url,
    demo_url = EXCLUDED.demo_url,
    content_type = EXCLUDED.content_type,
    google_docs_url = EXCLUDED.google_docs_url,
    pdf_url = EXCLUDED.pdf_url,
    content = EXCLUDED.content,
    related_article_id = EXCLUDED.related_article_id,
    display_order = EXCLUDED.display_order,
    is_published = EXCLUDED.is_published;

-- Atualizar chave estrangeira reversa em articles para os projetos vinculados
UPDATE public.articles SET related_work_id = 'agentmetrics' WHERE id = 'art-1';
UPDATE public.articles SET related_work_id = 'medical-segmentation' WHERE id = 'art-2';

-- 3. PENSAMENTOS (THOUGHTS)
INSERT INTO public.thoughts (
    id, title, category, tags, short_description, about_context,
    content_type, content, display_order, is_published
) VALUES 
(
    'th-1',
    'A Intersecção entre Hiper-realismo no Desenho e Engenharia de Software',
    'Pessoal',
    ARRAY['Reflexão', 'Design', 'Arte', 'Código'],
    'Como a paciência e a observação micrométrica do desenho a grafite moldam a precisão na escrita de código limpo.',
    'Ensaio pessoal sobre foco, paciência e atenção aos mínimos detalhes.',
    'markdown',
    '# A Intersecção entre Hiper-realismo no Desenho e Engenharia de Software\n\nNo hiper-realismo, você não desenha um olho; você desenha cada gradiente de luz refletido na íris, cada micro-textura da pele e cada sombra de oclusão.\n\nNa engenharia de software e no treinamento de redes neurais, o princípio é idêntico: a excelência não surge de um golpe de sorte, mas da soma milimétrica de refinamentos consistentes.',
    0,
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    short_description = EXCLUDED.short_description,
    about_context = EXCLUDED.about_context,
    content_type = EXCLUDED.content_type,
    content = EXCLUDED.content,
    display_order = EXCLUDED.display_order,
    is_published = EXCLUDED.is_published;

-- 4. CONFIGURAÇÃO DE CV (CV_CONFIGS)
INSERT INTO public.cv_configs (id, google_docs_url, pdf_url, updated_at)
VALUES (
    'production',
    'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    '/Matheus Vinicius Silva Freire de Castro.pdf',
    now()
)
ON CONFLICT (id) DO UPDATE SET
    google_docs_url = EXCLUDED.google_docs_url,
    pdf_url = EXCLUDED.pdf_url,
    updated_at = EXCLUDED.updated_at;

-- 5. CONFIGURAÇÃO DO AGENTE DE IA (AGENT_CONFIGS)
INSERT INTO public.agent_configs (id, model_name, system_prompt, max_tokens, temperature, updated_at)
VALUES (
    'production',
    'Qwen 2.5 Coder 32B-Instruct',
    'Você é o Assistente Oficial de Inteligência Artificial do portfólio de Matheus de Castro.

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
2. RECUSA DE ESCOPO: Se o visitante pedir receitas, conselhos ou tópicos fora do escopo, responda: "Como assistente oficial do portfólio de Matheus de Castro, meu escopo é restrito a informações sobre seus projetos de IA, backend e qualificações profissionais. Como posso te ajudar a conhecer o trabalho dele?"
3. SEM ALUCINAÇÃO: Nunca invente tecnologias, empresas ou projetos que não estejam no contexto fornecido.
4. TOM DE VOZ: Técnico, conciso, profissional, respeitoso e direto ao ponto.
5. REFERÊNCIA A PROJETOS: Sempre que citar um projeto, mencione suas principais tecnologias e convide o usuário a clicar em "Saber mais" na página.
6. IDIOMA: Responda no mesmo idioma em que a pergunta foi formulada.',
    1024,
    0.3,
    now()
)
ON CONFLICT (id) DO UPDATE SET
    model_name = EXCLUDED.model_name,
    system_prompt = EXCLUDED.system_prompt,
    max_tokens = EXCLUDED.max_tokens,
    temperature = EXCLUDED.temperature,
    updated_at = EXCLUDED.updated_at;

-- ==============================================================================
-- 11. SUPABASE STORAGE (BUCKET PÚBLICO PARA DOCUMENTOS, CV E DESENHOS)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', true, 10485760, ARRAY['application/pdf', 'image/webp', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/webp', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

DO $$ BEGIN
    CREATE POLICY "Public Document Access" ON storage.objects
        FOR SELECT USING (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admin Document Upload" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admin Document Update" ON storage.objects
        FOR UPDATE USING (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admin Document Delete" ON storage.objects
        FOR DELETE USING (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 12. TABELA DE DESENHOS E ARTES VISUAIS (DRAWINGS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.drawings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    src TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_drawings_order ON public.drawings(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_drawings_published ON public.drawings(is_published);

DROP TRIGGER IF EXISTS trg_drawings_updated_at ON public.drawings;
CREATE TRIGGER trg_drawings_updated_at BEFORE UPDATE ON public.drawings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Drawings" ON public.drawings;
CREATE POLICY "Public Read Drawings" ON public.drawings
    FOR SELECT TO anon, authenticated
    USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Insert Drawings" ON public.drawings;
CREATE POLICY "Admin Insert Drawings" ON public.drawings
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update Drawings" ON public.drawings;
CREATE POLICY "Admin Update Drawings" ON public.drawings
    FOR UPDATE TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete Drawings" ON public.drawings;
CREATE POLICY "Admin Delete Drawings" ON public.drawings
    FOR DELETE TO authenticated
    USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 9. TABELA DE BLOG POSTS (CANAL TECH & CANAL ALOMYR)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    channel VARCHAR(50) NOT NULL DEFAULT 'tech',
    title_pt VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    summary_pt TEXT NOT NULL,
    summary_en TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    cover_image TEXT,
    youtube_url TEXT,
    gallery_images TEXT[] NOT NULL DEFAULT '{}',
    content_pt TEXT NOT NULL,
    content_en TEXT NOT NULL,
    related_project_id TEXT,
    author VARCHAR(100) NOT NULL DEFAULT 'Matheus de Castro',
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    read_time VARCHAR(50) NOT NULL DEFAULT '5 min',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_channel ON public.blog_posts(channel);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON public.blog_posts(published_at DESC);

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Blog Posts" ON public.blog_posts;
CREATE POLICY "Public Read Blog Posts" ON public.blog_posts
    FOR SELECT TO anon, authenticated
    USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Insert Blog Posts" ON public.blog_posts;
CREATE POLICY "Admin Insert Blog Posts" ON public.blog_posts
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update Blog Posts" ON public.blog_posts;
CREATE POLICY "Admin Update Blog Posts" ON public.blog_posts
    FOR UPDATE TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete Blog Posts" ON public.blog_posts;
CREATE POLICY "Admin Delete Blog Posts" ON public.blog_posts
    FOR DELETE TO authenticated
    USING (auth.role() = 'authenticated');
