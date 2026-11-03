# 📦 Dados do Portfólio de Matheus de Castro (Dividido em Partes para Supabase)

Este documento contém todos os seus projetos, artigos, pensamentos e experiências profissionais formatados e prontos para inserção direta no **SQL Editor** do Supabase.

Você pode rodar tudo de uma vez ou executar parte por parte.

---

## 🔒 PARTE 0: Trava de Segurança Definitiva (Apenas Matheus-dCastro)

Execute este bloco para que **apenas o seu usuário do GitHub e seu email** tenham permissão de alterar ou apagar dados no banco de dados:

```sql
-- Função de checagem do Administrador Oficial
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (
        auth.jwt() ->> 'email' ILIKE 'matheus.vsf.castro.25@gmail.com'
        OR auth.jwt() -> 'user_metadata' ->> 'user_name' ILIKE 'Matheus-dCastro'
        OR auth.jwt() -> 'user_metadata' ->> 'preferred_username' ILIKE 'Matheus-dCastro'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar a trava de administrador nas tabelas
DROP POLICY IF EXISTS "Admin Insert Works" ON public.works;
CREATE POLICY "Admin Insert Works" ON public.works FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Update Works" ON public.works;
CREATE POLICY "Admin Update Works" ON public.works FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Works" ON public.works;
CREATE POLICY "Admin Delete Works" ON public.works FOR DELETE TO authenticated USING (public.is_admin());
```

---

## 🏢 PARTE 1: Projetos Profissionais & Corporativos

```sql
INSERT INTO public.works (
    id, title, category, tags, short_description, about_context,
    github_url, demo_url, content_type, google_docs_url, pdf_url,
    content, display_order, is_published
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
    0,
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
    1,
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
    content = EXCLUDED.content,
    display_order = EXCLUDED.display_order,
    is_published = EXCLUDED.is_published;
```

---

## 🚀 PARTE 2: Projetos Pessoais & Inovações

```sql
INSERT INTO public.works (
    id, title, category, tags, short_description, about_context,
    github_url, demo_url, content_type, google_docs_url, pdf_url,
    content, display_order, is_published
) VALUES 
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
    2,
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
    3,
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
    4,
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
    content = EXCLUDED.content,
    display_order = EXCLUDED.display_order,
    is_published = EXCLUDED.is_published;
```

---

## 🎓 PARTE 3: Projetos Acadêmicos & Pesquisas

```sql
INSERT INTO public.works (
    id, title, category, tags, short_description, about_context,
    github_url, demo_url, content_type, google_docs_url, pdf_url,
    content, display_order, is_published
) VALUES 
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
    5,
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
    6,
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
    7,
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
    content = EXCLUDED.content,
    display_order = EXCLUDED.display_order,
    is_published = EXCLUDED.is_published;
```

---

## 📑 PARTE 4: Artigos Técnicos e Pensamentos

```sql
-- Artigos
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
    '# Otimização de Inferência em Modelos de Linguagem na Borda\n\nEste artigo encontra-se sincronizado com o documento no Google Docs.',
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
    '# Segmentação U-Net Aplicada a Tomografias Pulmonares\n\nArtigo publicado com diagramas de arquitetura e curvas de convergência.',
    1,
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    content = EXCLUDED.content;

-- Pensamentos
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
    content = EXCLUDED.content;
```

---

## 💼 PARTE 5: Tabela de Experiências Profissionais

```sql
-- 1. Criação da Tabela de Experiências
CREATE TABLE IF NOT EXISTS public.experiences (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    time VARCHAR(255) NOT NULL,
    bullets TEXT[] NOT NULL DEFAULT '{}',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar Segurança RLS
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Experiences" ON public.experiences;
CREATE POLICY "Public Read Experiences" ON public.experiences
    FOR SELECT TO anon, authenticated
    USING (is_published = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Manage Experiences" ON public.experiences;
CREATE POLICY "Admin Manage Experiences" ON public.experiences
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

GRANT ALL ON TABLE public.experiences TO anon, authenticated;

-- 3. Inserir Experiências Existentes
INSERT INTO public.experiences (id, title, company, time, bullets, display_order, is_published)
VALUES 
(
    'exp-detran',
    'IT Intern',
    'Detran',
    'Junho 2026 - Atualmente',
    ARRAY[
        'Projetar, desenvolver e implementar softwares para atender as necessidades do Órgão;',
        'Utilizando técnicas de programação e gestão de projetos;',
        'Desenvolver análise de requisitos;',
        'Desenvolver projetos para aplicativo mobile.'
    ],
    0,
    true
),
(
    'exp-cachina',
    'IT Intern',
    'Cachina Soluções',
    'Março 2026 - Julho 2026',
    ARRAY[
        'Desenvolvimento e otimização de arquiteturas de backend;',
        'Automação de fluxos de trabalho inteligentes utilizando n8n integrados a ecossistemas digitais;',
        'Gerenciamento ágil de servidores Linux (Ubuntu Server) e documentação técnica de processos operacionais;',
        'Principais tecnologias utilizadas: Python, SQL, n8n, Linux, Bash e Git.'
    ],
    1,
    true
),
(
    'exp-ufrn',
    'Bacharelado em Tecnologia da Informação (BTI)',
    'UFRN - Campus Natal',
    '2024.1 - Presente',
    ARRAY[
        'Cursando o 6º período',
        'Sólida base acadêmica em algoritmos, estruturas de dados avançadas, estatística e álgebra linear aplicadas.',
        'Foco em andamento nas áreas de MLOps, Deep Learning, Aprendizado por Reforço e Computação de Alto Desempenho.'
    ],
    2,
    true
),
(
    'exp-ifrn',
    'IT Technician Training',
    'IFRN Campus Lajes',
    '2019 - 2022',
    ARRAY[
        'Formação técnica integrada estruturada com foco em Desenvolvimento web;',
        'Desenvolvimento de lógica algorítmica sólida e fundamentos de bancos de dados relacionais;',
        'Práticas de laboratório envolvendo montagem, manutenção e implantação de arquiteturas operacionais locais.'
    ],
    3,
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    company = EXCLUDED.company,
    time = EXCLUDED.time,
    bullets = EXCLUDED.bullets,
    display_order = EXCLUDED.display_order;
```
