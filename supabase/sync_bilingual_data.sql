-- ====================================================================
-- SINCRONIZAÇÃO DE CONTEÚDO BILÍNGUE (EN / PT) NO SUPABASE
-- Atualização completa de Works, Experiences e Thoughts
-- Zero Emojis | Texto padrão em Inglês (EN) com suporte nativo a PT
-- ====================================================================

-- 1. ATUALIZAÇÃO DA TABELA 'works'

-- Projeto: agentmetrics
UPDATE public.works
SET
    title = 'AgentMetrics',
    category = 'Profissional',
    tags = ARRAY['FastAPI', 'Data & ML', 'Python', 'Docker']::TEXT[],
    short_description = 'Intelligent telemetry API built to monitor resource consumption and benchmark AI agent performance in real-time. <!-- BILINGUAL_SPLIT --> API de telemetria inteligente desenvolvida para monitorar o consumo de recursos e metrificar o desempenho de agentes de IA em tempo real.',
    about_context = 'Monitoring and telemetry system for LLMs and autonomous agents. Collects latency metrics, token consumption, cost per request, and inference throughput in AI clusters. <!-- BILINGUAL_SPLIT --> Sistema de monitoramento e telemetria para LLMs e agentes autônomos. Coleta métricas de latência, consumo de tokens, custo por requisição e vazão de inferência em clusters de IA.',
    github_url = 'https://github.com/Matheus-dCastro/AgentMetrics',
    demo_url = '',
    content = '# AgentMetrics: Telemetry for Autonomous AI Agents

A robust telemetry and observability platform engineered to monitor LLM-based autonomous agents in production environments.

## Overview & Problem Statement
As artificial intelligence agents are integrated into enterprise business processes, real-time tracking of token consumption, inference latency, and answer correctness becomes essential. AgentMetrics addresses these operational challenges with an asynchronous, event-driven telemetry architecture.

## Architecture and Tech Stack
- **FastAPI (Python 3.11):** High-throughput backend using native asynchronous endpoints (`async/await`).
- **PostgreSQL & TimescaleDB:** Optimized time-series storage engine for low-latency metric ingestion and aggregation.
- **Docker & Docker Compose:** Complete containerization of services ensuring reproducible local and staging environments.
- **Pydantic v2:** Strict runtime data validation and contract enforcement across all telemetry ingestion pipelines.

## Monitored Metrics
1. **Time to First Token (TTFT):** Initial perceived latency from prompt dispatch to the first streaming chunk.
2. **Hallucination & Conformance Rate:** Heuristic evaluation combined with synthetic LLM judge benchmarks.
3. **Memory & VRAM Utilization:** Hardware profiling during local and distributed inference passes.
4. **Estimated Cost Per Session:** Real-time billing computation based on input, output, and cached token tiers.

```python
# Example of agent instrumentation with AgentMetrics
from agentmetrics import telemetry, MetricContext

@telemetry.trace(agent_name="qwen-coder-32b")
async def process_prompt(prompt: str) -> str:
    with MetricContext.track_tokens() as tracker:
        response = await llm_engine.generate(prompt)
        tracker.record(model="qwen-2.5", tags=["dev", "backend"])
    return response
```

## Running Locally
```bash
# Clone the repository
git clone https://github.com/Matheus-dCastro/AgentMetrics.git
cd AgentMetrics

# Launch stack with Docker
docker-compose up --build
```

<!-- BILINGUAL_SPLIT -->

# AgentMetrics: Telemetria de Agentes Autônomos de IA

Uma solução robusta de telemetria e observabilidade desenvolvida para monitorar agentes baseados em LLMs em ambientes de produção.

## Problema & Visão Geral
À medida que agentes de inteligência artificial são integrados a rotinas corporativas, torna-se crítico rastrear o consumo de tokens, os tempos de inferência e a assertividade das respostas. O AgentMetrics resolve isso com uma arquitetura assíncrona orientada a eventos.

## Arquitetura e Tecnologias
- **FastAPI (Python 3.11):** Backend de alta performance com endpoints assíncronos (`async/await`).
- **PostgreSQL & TimescaleDB:** Armazenamento otimizado para séries temporais de métricas.
- **Docker & Docker Compose:** Conteinerização de todos os serviços para reprodutibilidade.
- **Pydantic v2:** Validação estrita de contratos de dados em tempo de execução.

## Métricas Monitoradas
1. **Time to First Token (TTFT):** Latência inicial percebida pelo usuário.
2. **Taxa de Alucinação / Conformidade:** Avaliação heurística e por juiz sintético.
3. **Consumo de Memória e VRAM:** Uso de recursos computacionais durante inferências locais e remotas.
4. **Custo Estimado por Sessão:** Metrificação de gastos com tokens de entrada e saída.

```python
# Exemplo de instrumentação de agente com AgentMetrics
from agentmetrics import telemetry, MetricContext

@telemetry.trace(agent_name="qwen-coder-32b")
async def process_prompt(prompt: str) -> str:
    with MetricContext.track_tokens() as tracker:
        response = await llm_engine.generate(prompt)
        tracker.record(model="qwen-2.5", tags=["dev", "backend"])
    return response
```

## Como Executar Localmente
```bash
# Clone o repositório
git clone https://github.com/Matheus-dCastro/AgentMetrics.git
cd AgentMetrics

# Suba a stack com Docker
docker-compose up --build
```',
    updated_at = timezone('utc'::text, now())
WHERE id = 'agentmetrics';

-- Projeto: medical-segmentation
UPDATE public.works
SET
    title = 'Medical Image Segmentation <!-- BILINGUAL_SPLIT --> Segmentação de Imagens Médicas',
    category = 'Acadêmico',
    tags = ARRAY['Deep Learning', 'Python', 'PyTorch', 'U-Net']::TEXT[],
    short_description = 'Supervised Deep Learning pipeline for pixel-level semantic segmentation of medical imaging structures using U-Net architecture. <!-- BILINGUAL_SPLIT --> Pipeline de Deep Learning supervisionado para segmentação pixel a pixel de estruturas e lesões em imagens médicas utilizando arquitetura U-Net.',
    about_context = 'Academic research and practical implementation of convolutional networks and U-Net architecture for semantic segmentation of CT and MRI scans. <!-- BILINGUAL_SPLIT --> Pesquisa acadêmica e aplicação prática de redes convolucionais e arquitetura U-Net para segmentação semântica de exames de tomografia e ressonância magnética.',
    github_url = 'https://github.com/Matheus-dCastro/Projeto-de-AM-Supervisionado',
    demo_url = '',
    content = '# Medical Image Segmentation with U-Net Architecture

Supervised Deep Learning project focused on pixel-level semantic segmentation of anatomical structures and pathologies in clinical diagnostic scans.

## Methodology & Theoretical Foundation
Semantic segmentation in medical diagnostics demands high sensitivity and boundary precision. We implemented a deep convolutional neural network with symmetrical skip connections based on the U-Net architecture.

### Data Pipeline
- **Preprocessing:** Contrast stretching, histogram normalization, Region of Interest (ROI) extraction, and elastic deformation augmentation.
- **Loss Formulation:** Weighted combination of Dice Loss and Binary Cross-Entropy (BCE) to overcome severe background-to-lesion class imbalance.

## Empirical Benchmark Results
| Metric | Mean Score | Standard Deviation |
| :--- | :--- | :--- |
| **Dice Score (F1)** | **0.894** | ± 0.021 |
| **IoU (Jaccard Index)** | **0.812** | ± 0.028 |
| **Precision** | **0.915** | ± 0.015 |
| **Recall / Sensitivity** | **0.882** | ± 0.024 |

> "Combining Dice Loss with edge penalty reduced false boundary artifacts in complex anatomical contours by more than 18%."

## Core Technologies
- Python 3.10
- PyTorch & Torchvision
- Albumentations for Spatial & Elastic Augmentation
- OpenCV & Matplotlib for Analysis

<!-- BILINGUAL_SPLIT -->

# Medical Image Segmentation com Arquitetura U-Net

Projeto de Aprendizado de Máquina Supervisionado focado na segmentação precisa de patologias em imagens de diagnóstico por imagem.

## Metodologia e Fundamentação
A segmentação semântica no domínio médico requer alta sensibilidade e especificidade. Utilizamos uma rede neural convolucional com conexões de salto (*skip connections*) baseada na consagrada arquitetura U-Net.

### Pipeline de Dados
- **Pré-processamento:** Normalização de histograma, corte de ROI (*Region of Interest*) e ampliação de dados (*Data Augmentation*) geométrica e elástica.
- **Funções de Perda:** Combinação ponderada de *Dice Loss* com *Binary Cross-Entropy* para contornar o severo desbalanceamento de classes pixel a pixel.

## Resultados Obtidos
| Métrica | Valor Médio | Desvio Padrão |
| :--- | :--- | :--- |
| **Dice Score (F1)** | **0.894** | ± 0.021 |
| **IoU (Jaccard)** | **0.812** | ± 0.028 |
| **Precisão** | **0.915** | ± 0.015 |
| **Recall / Sensibilidade** | **0.882** | ± 0.024 |

> "A combinação de Dice Loss com penalização de borda reduziu artefatos em contornos anatômicos complexos em mais de 18%."

## Tecnologias
- Python 3.10
- PyTorch & Torchvision
- Albumentations para Data Augmentation
- OpenCV & Matplotlib',
    updated_at = timezone('utc'::text, now())
WHERE id = 'medical-segmentation';

-- Projeto: obsidian-neon-theme
UPDATE public.works
SET
    title = 'Obsidian Neon Theme',
    category = 'Pessoal',
    tags = ARRAY['VS Code Theme', 'UI & Design', 'JSON', 'Design System']::TEXT[],
    short_description = 'High-contrast neon theme and visual design system for VS Code featuring refined semantic syntax highlighting. <!-- BILINGUAL_SPLIT --> Tema e suíte visual para VS Code com paletas neon de alto contraste, ícones customizados e realce de sintaxe semântico refinado.',
    about_context = 'Visual Studio Code Marketplace published extension designed with visual ergonomics for developers coding in low-light environments. <!-- BILINGUAL_SPLIT --> Extensão publicada no Visual Studio Code Marketplace projetada com ergonomia visual para programadores que passam longas horas codificando em ambientes de baixa luminosidade.',
    github_url = 'https://github.com/Matheus-dCastro/obsidian-neon-thema',
    demo_url = 'https://marketplace.visualstudio.com/items?itemName=Alomyr.obsidian-neon-110',
    content = '# Obsidian Neon Theme for Visual Studio Code

A refined cyberpunk-aesthetic dark theme engineered for exceptional legibility and reduced ocular fatigue during long nocturnal coding sessions.

## Design Philosophy
Drawing inspiration from the micrometric precision of hyperrealistic graphite drawing and the energetic contrast of glowing neon interfaces, Obsidian Neon pairs ultra-deep charcoal foundations (#030306 and #08080c) with luminous violet and electric cyan accents.

- **Semantic Token Clarity:** Immediate cognitive distinction between primitive types, control-flow statements, object attributes, and method invocations.
- **WCAG AAA Compliance:** High-contrast ratios exceeding 7:1 across all active syntax scopes, protecting ocular health.
- **Polyglot Syntax Grammar:** Custom-tuned token scopes for Python, C++, Rust, TypeScript, Java, and Markdown.

## Installation
In Visual Studio Code, press `Ctrl+P` (or `Cmd+P` on macOS) and run:
```bash
ext install Alomyr.obsidian-neon-110
```

<!-- BILINGUAL_SPLIT -->

# Obsidian Neon Theme para Visual Studio Code

Tema com estética cyberpunk refinada, focado em alta legibilidade sem fadiga visual para sessões noturnas de código.

## Filosofia de Design
Inspirado na precisão do traço do hiper-realismo e no contraste dinâmico de interfaces neons, o Obsidian Neon equilibra tons escuros profundos (#030306 e #08080c) com acentos violetas luminosos e ciano elétrico.

- **Tokens Semânticos Claros:** Diferenciação visual imediata entre tipos primitivos, palavras-chave de controle de fluxo e chamadas de métodos.
- **Contraste WCAG AAA:** Mais de 7:1 de proporção de contraste em todo o código fonte.
- **Suporte Multilinguagem:** Otimizado para Python, C++, Rust, TypeScript, Java e Markdown.

## Instalação
No VS Code, abra a paleta de comandos (`Ctrl+P` ou `Cmd+P`) e execute:
```bash
ext install Alomyr.obsidian-neon-110
```',
    updated_at = timezone('utc'::text, now())
WHERE id = 'obsidian-neon-theme';

-- Projeto: cachina-solucoes
UPDATE public.works
SET
    title = 'Cachina Solutions <!-- BILINGUAL_SPLIT --> Cachina Soluções',
    category = 'Profissional',
    tags = ARRAY['Automation & Web', 'n8n', 'Linux', 'Bash']::TEXT[],
    short_description = 'Development and infrastructure hosting for corporate digital ecosystems and strategic workflow automation. <!-- BILINGUAL_SPLIT --> Desenvolvimento e hospedagem do ecossistema de interfaces e apresentação estratégica corporativa.',
    about_context = 'Corporate platform and intelligent workflow automation implemented for Cachina Soluções. <!-- BILINGUAL_SPLIT --> Plataforma corporativa e automação de processos inteligentes implementada para a empresa Cachina Soluções.',
    github_url = 'https://github.com/Matheus-dCastro/Site-Cachina-2026',
    demo_url = 'https://cachina.com.br/',
    content = '# Cachina Solutions: Digital Ecosystem & Automation

Enterprise engineering engagement delivering corporate web architecture, end-to-end workflow automation, and dedicated cloud server administration.

## Scope of Work
- Implementation of automated continuous workflows and intelligent pipelines using **n8n**.
- Provisioning, configuration, and maintenance of dedicated Linux servers (Ubuntu Server).
- Development of a high-performance corporate web interface optimized for sub-second loading speeds and Core Web Vitals.
- Integration of custom lead-generation funnels and authenticated webhook triggers.

## Automation Architecture
Automated nodes in n8n process multi-step business logic, transforming incoming payloads, syncing relational database records, and notifying operational stakeholders via encrypted channels in real-time.

## Security and Cloud Infrastructure
- Hardened Ubuntu Server configurations featuring strict UFW firewall policies, fail2ban, and ed25519 SSH key authentication.
- Automated snapshot backups and proactive service health monitoring.

<!-- BILINGUAL_SPLIT -->

# Cachina Soluções: Ecossistema Digital & Automação

Projeto corporativo abrangendo a arquitetura de apresentação institucional, automação de processos e gestão de infraestrutura em nuvem.

## Escopo do Trabalho
- Implementação de fluxos de integração contínua e automação com **n8n**.
- Configuração e sustentação de servidores dedicados Linux (Ubuntu Server).
- Criação da interface web institucional com carregamento ultra rápido e SEO otimizado.
- Integração de formulários de captação e disparos via webhooks corporativos.

## Arquitetura de Automação
Os nós de execução no n8n foram estruturados para orquestrar rotinas de qualificação de leads, sincronização de bancos de dados relacionais e alertas em tempo real para equipes operacionais via canais criptografados.

## Segurança e Infraestrutura
- Servidores Ubuntu Server configurados com firewall UFW rigoroso e chaves SSH ed25519.
- Políticas de backup periódico automatizado e monitoramento contínuo de uptime.',
    updated_at = timezone('utc'::text, now())
WHERE id = 'cachina-solucoes';

-- Projeto: task-system-cli
UPDATE public.works
SET
    title = 'Task System CLI',
    category = 'Pessoal',
    tags = ARRAY['Python & SQL', 'PostgreSQL', 'MVC', 'CLI']::TEXT[],
    short_description = 'Complete MVC architecture with PostgreSQL persistence for high-efficiency terminal-based task workflows. <!-- BILINGUAL_SPLIT --> Arquitetura MVC completa com persistência em PostgreSQL para controle eficiente de fluxos de trabalho via terminal.',
    about_context = 'Python CLI application strictly implementing Model-View-Controller design patterns with relational persistence. <!-- BILINGUAL_SPLIT --> Aplicativo CLI desenvolvido em Python seguindo rigorosamente os padrões de projeto MVC com persistência relacional.',
    github_url = 'https://github.com/Matheus-dCastro/Sistema-de-Controle-em-Py3',
    demo_url = '',
    content = '# Task System CLI: Terminal Productivity Suite

A fast, interactive command-line application for task tracking, team task prioritization, and activity auditing powered by PostgreSQL.

## Architectural Architecture
The application strictly enforces the Model-View-Controller (MVC) separation of concerns:
- **Model:** Encapsulates domain logic, entity validation, and pooled relational database queries.
- **View:** Terminal presentation layer rendering formatted tables, ANSI colors, and intuitive interactive menus.
- **Controller:** Orchestrates business transactions, concurrency constraints, and atomic ACID operations.

## Key Capabilities
1. **Lifecycle Management:** Creation, status progression, tag assignment, and audit archiving.
2. **Expressive Querying:** Rich filtering by tag, due date range, priority level, and assignee.
3. **Robust Data Layer:** Connection pooling with automated schema initialization and prepared statements.

## CLI Usage Example
```bash
# List pending tasks with high priority
task-cli list --status pending --priority high

# Complete a task by ID
task-cli complete --id 42
```

<!-- BILINGUAL_SPLIT -->

# Task System CLI: Gestão Produtiva no Terminal

Ferramenta CLI para gerenciamento ágil de tarefas e auditoria de atividades com banco de dados PostgreSQL.

## Padrão Arquitetural
Adotou-se o modelo MVC (Model-View-Controller):
- **Model:** Entidades de domínio mapeadas com validação e conexões seguras ao banco de dados relacional.
- **View:** Interface de linha de comando com menus interativos e saída tabulada colorida.
- **Controller:** Orquestrador das regras de negócio, bloqueios de concorrência e transações atômicas ACID.

## Funcionalidades Principais
1. **Controle de Ciclo de Vida:** Criação, priorização, arquivamento e transições de status de tarefas.
2. **Consultas Estruturadas:** Filtros flexíveis por tag, data de vencimento, urgência e responsável.
3. **Persistência Confiável:** Pool de conexões otimizado em PostgreSQL com migrações de esquema declarativas.

## Exemplo de Uso
```bash
# Listar tarefas pendentes com alta prioridade
task-cli list --status pending --priority high

# Marcar tarefa como concluída
task-cli complete --id 42
```',
    updated_at = timezone('utc'::text, now())
WHERE id = 'task-system-cli';

-- Projeto: timemaster
UPDATE public.works
SET
    title = 'TimeMaster',
    category = 'Acadêmico',
    tags = ARRAY['Java', 'OOP', 'LP2', 'Design Patterns']::TEXT[],
    short_description = 'Modular Java backend system for complex appointment scheduling and calendar conflict resolution. <!-- BILINGUAL_SPLIT --> Sistema modular backend para gerenciamento de compromissos e agendamentos complexos desenvolvido em LP2.',
    about_context = 'Academic Programming Language 2 project exploring pure object-oriented design, design patterns, and robust exception handling. <!-- BILINGUAL_SPLIT --> Projeto acadêmico de Linguagem de Programação 2 explorando programação orientada a objetos pura, padrões de projeto e tratamento robusto de exceções.',
    github_url = 'https://github.com/Matheus-dCastro/Sistema-de-Agenda-de-Compromissos.git',
    demo_url = '',
    content = '# TimeMaster: Java Appointment Scheduling Engine

Modular Java scheduling system architected with immutable value classes for robust time-interval calculations and automated calendar collision resolution.

## System Overview
Developed as an academic project in Programming Language 2 (LP2), TimeMaster demonstrates pure Object-Oriented Programming (OOP) principles in modern Java, emphasizing immutability, design patterns, and enterprise exception handling.

## Design Patterns & Core Architecture
- **Immutable Value Objects:** Encapsulation of `TimeInterval` and `AppointmentDate` records preventing race conditions and unintentional side-effects in concurrent execution environments.
- **Factory Pattern:** Controlled instantiation of appointment entities with strict boundary assertions (start time strictly preceding end time, operating business hours validation).
- **Strategy Pattern:** Pluggable resolution algorithms for handling scheduling collisions (rejection strategy, next-available-slot allocation, and alternative slot recommendation).
- **Domain Exception Hierarchy:** Explicit custom exceptions such as `TimeConflictException` and `InvalidSlotException` enabling clean error propagation and boundary handling.

## Core Features
1. **Collision Detection:** Efficient overlapping interval evaluation executing in O(log n) time using balanced search indices.
2. **Recurrence Engine:** Scheduling support for daily, weekly, and custom interval patterns with leap-year and variable-month corrections.
3. **Repository Abstraction:** Decoupled persistence interface supporting in-memory storage and structured file serialization.

<!-- BILINGUAL_SPLIT -->

# TimeMaster: Gestão de Agendamentos em Java

Arquitetura modular em Java com classes imutáveis para cálculo de intervalos de tempo e resolução automática de conflitos em calendários.

## Visão Geral do Sistema
O TimeMaster foi desenvolvido na disciplina de Linguagem de Programação 2 (LP2) com o objetivo de demonstrar os princípios fundamentais da Orientação a Objetos em Java moderno, aplicando padrões de projeto consolidados e evitando armadilhas clássicas de mutabilidade temporal.

## Padrões de Projeto & Arquitetura
- **Objetos de Valor Imutáveis:** Representação de intervalos (`TimeInterval`) e datas (`AppointmentDate`) utilizando registros ou classes finais imutáveis, prevenindo efeitos colaterais em ambientes multithread.
- **Factory Pattern:** Instanciação controlada de compromissos com regras de validação estritas (horário de início anterior ao horário de término, dias úteis e janelas de atendimento).
- **Strategy Pattern:** Algoritmos intercambiáveis para detecção e resolução de colisões de agendamento (estratégia de recusa imediata, estratégia de alocação no próximo horário disponível e sugestão de reagendamento).
- **Hierarquia de Exceções Personalizadas:** Lançamento de exceções específicas como `TimeConflictException` e `InvalidSlotException`, simplificando o tratamento de erros na camada de controle.

## Funcionalidades
1. **Validação de Sobreposição:** Detecção instantânea de intervalos concorrentes com complexidade O(log n).
2. **Recorrência Flexível:** Agendamentos diários, semanais e mensais com tratamento de meses com diferentes números de dias e anos bissextos.
3. **Persistência Modular:** Abstração de repositório permitindo armazenamento em memória ou serialização de arquivos.',
    updated_at = timezone('utc'::text, now())
WHERE id = 'timemaster';

-- Projeto: zombie-dice
UPDATE public.works
SET
    title = 'Zombie Dice',
    category = 'Acadêmico',
    tags = ARRAY['C++', 'OOP', 'State Machine', 'CLI Game']::TEXT[],
    short_description = 'Object-oriented implementation and finite state machine for a terminal-based dice strategy game. <!-- BILINGUAL_SPLIT --> Implementação orientada a objetos e máquina de estados para execução de jogo de dados lógico via terminal CLI.',
    about_context = 'Probabilistic strategy game implemented in modern C++ with manual memory management and state machine design. <!-- BILINGUAL_SPLIT --> Jogo de estratégia probabilística implementado em C++ com gerenciamento manual de memória e máquina de estados finitos.',
    github_url = 'https://github.com/Matheus-dCastro/trabalho-06-projeto-zombie-dice-Turma-DIM0176---PROGRAMA-O-I---T02-2025.1-.git',
    demo_url = '',
    content = '# Zombie Dice: Modern C++ Game Engine

A full-featured C++ implementation of the Push-Your-Luck dice game featuring a finite state machine architecture and statistical risk-assessment algorithms.

## Game Overview
Zombie Dice is a renowned turn-based dice game exploring decision-making under uncertainty. This modern C++ implementation translates the official game dynamics into an elegant, object-oriented framework driven by a robust Finite State Machine (FSM).

## Software Architecture
- **Finite State Machine (FSM):** Strict state transitions (`TurnStart`, `DiceRolling`, `DecisionWait`, `TurnEnd`, `GameOver`) enforcing valid gameplay progression and eliminating illegal actions.
- **Modern RAII & Memory Safety:** Idiomatic utilization of `std::unique_ptr`, `std::vector`, and standard algorithms to ensure zero resource leaks without manual pointer arithmetic.
- **Stochastic Cup Model:** Precise physical simulation of the 13-dice dice cup (6 green, 4 yellow, 3 red) with weighted face distributions for brains, footprints, and shotgun blasts.

## Push-Your-Luck Heuristic
Includes an automated analytical engine evaluating risk-versus-reward probabilities based on shotgun wound counts, dice remaining in the cup, and overall victory thresholds to guide optimal stop-or-roll decisions.

<!-- BILINGUAL_SPLIT -->

# Zombie Dice em C++ Moderno

Implementação completa das regras do jogo com simulação estatística de probabilidades de rolagem e inteligência para decisão de parada (Push Your Luck).

## Visão Geral do Jogo
Zombie Dice é um clássico jogo de dados e tomada de decisão sob incerteza. Nesta implementação em C++ moderno, todo o fluxo de regras foi modelado com uma arquitetura orientada a objetos limpa e uma máquina de estados finitos que gerencia os turnos e a pontuação dos jogadores.

## Arquitetura de Software
- **Máquina de Estados Finitos (FSM):** Estados bem delimitados (`TurnStart`, `DiceRolling`, `DecisionWait`, `TurnEnd`, `GameOver`), garantindo transições determinísticas e evitando estados inconsistentes.
- **Gerenciamento de Memória & RAII:** Uso rigoroso de `std::unique_ptr` e `std::vector`, eliminando alocações manuais de memória e prevenindo vazamentos de recursos.
- **Modelo de Dados Probabilístico:** O copo contém 13 dados com diferentes distribuições de faces (6 verdes, 4 amarelos e 3 vermelhos), simulando com precisão a probabilidade estatística de obtenção de cérebros, pegadas ou tiros.

## Módulo Heurístico de Parada
O jogo conta com um algoritmo heurístico para agentes controlados pelo computador, calculando a razão risco-recompensa baseando-se no número de tiros acumulados e na quantidade de dados restantes no copo para determinar se o jogador deve continuar rolando ou garantir os pontos conquistados.',
    updated_at = timezone('utc'::text, now())
WHERE id = 'zombie-dice';

-- Projeto: projeto-snaze
UPDATE public.works
SET
    title = 'Snaze Project <!-- BILINGUAL_SPLIT --> Projeto Snaze',
    category = 'Acadêmico',
    tags = ARRAY['Game in CPP', 'C++', 'Algorithms', 'Pathfinding']::TEXT[],
    short_description = 'Autonomous pathfinding simulation guiding an intelligent snake through dynamic mazes using graph search algorithms. <!-- BILINGUAL_SPLIT --> Simulação computacional onde o programa guia uma serpente inteligente através de um labirinto até o alimento com algoritmos de busca.',
    about_context = 'Programming I academic project featuring graph representations, sparse matrices, and Breadth-First Search (BFS). <!-- BILINGUAL_SPLIT --> Trabalho acadêmico de Programação I envolvendo representação de grafos, matrizes espparsas e busca em largura (BFS).',
    github_url = 'https://github.com/Matheus-dCastro/trabalho-07-projeto-snaze--Turma-DIM0176---PROGRAMA-O-I---T02-2025.1-.git',
    demo_url = '',
    content = '# Snaze Project: Autonomous Maze Pathfinding

Autonomous maze-navigation simulation written in modern C++ guiding an intelligent agent through dynamic labyrinths using graph search algorithms.

## Project Overview
The Snaze Project is an algorithmic simulation in C++ where an autonomous agent (snake) navigates dynamic grid mazes, dodging fixed obstacles, boundaries, and its own elongating body to reach designated food targets.

## Algorithmic Foundation
- **Breadth-First Search (BFS):** Employs BFS over an unweighted 2D grid graph starting from the snake''s head, guaranteeing the discovery of the mathematically shortest route to the objective.
- **Spatial Grid Representation:** Memory-efficient 2D map representation allowing constant-time O(1) collision detection and boundary checks.
- **Survival Fallback Heuristics:** When food targets become temporarily unreachable or the shortest path creates a dead-end trap, the agent switches to a survival mode targeting the largest accessible open partition.

## Data Structures
- `std::queue` for standard FIFO node exploration in the BFS graph traversal.
- Double-ended queue (`std::deque`) for snake body segments, achieving O(1) head prepends and tail removals.

<!-- BILINGUAL_SPLIT -->

# Projeto Snaze: IA de Busca em Labirinto

Algoritmo de navegação autônoma em labirintos dinâmicos utilizando estruturas de fila e matrizes de adjacência.

## Visão Geral do Projeto
O Projeto Snaze é uma simulação computacional desenvolvida em C++ onde um agente autônomo (serpente) deve navegar por labirintos dinâmicos, desviando de obstáculos, paredes e de seu próprio corpo em crescimento, com o objetivo de alcançar sucessivos itens de comida.

## Fundamentação Algorítmica
- **Busca em Largura (BFS):** O algoritmo de busca em largura explora o grafo de grade não ponderada a partir da cabeça da serpente, garantindo matematicamente o encontro do menor trajeto possível até o alimento.
- **Matriz de Adjacência e Grids Esparsos:** Representação eficiente da topologia do labirinto com verificação de colisões em tempo constante O(1).
- **Heurística de Sobrevivência (Fallback):** Quando o alimento fica temporariamente inacessível ou o trajeto direto resultaria em encurralamento, a serpente ativa uma estratégia heurística de sobrevivência que busca o espaço livre mais amplo para evitar a morte prematura.

## Estruturas de Dados Utilizadas
- `std::queue` para expansão dos nós de busca na fila FIFO da BFS.
- Deque circular (`std::deque`) para modelagem do corpo da serpente com inserções na cabeça e remoções na cauda em complexidade O(1).',
    updated_at = timezone('utc'::text, now())
WHERE id = 'projeto-snaze';

-- Projeto: password-generator
UPDATE public.works
SET
    title = 'Password Generator',
    category = 'Pessoal',
    tags = ARRAY['CPP', 'Security', 'Entropy', 'CLI']::TEXT[],
    short_description = 'Deterministic and stochastic high-entropy password generator with configurable complexity validation. <!-- BILINGUAL_SPLIT --> Gerador determinístico e estocástico de senhas de alta entropia com validação de complexidade e tamanho configurável.',
    about_context = 'C++ security tool focused on secure cryptographic key generation and dictionary-attack resistant passwords. <!-- BILINGUAL_SPLIT --> Ferramenta de segurança em C++ focada em geração segura de chaves criptográficas e senhas resistentes a ataques de dicionário.',
    github_url = 'https://github.com/Matheus-dCastro/trabalho-03-projeto-passgen-Turma-DIM0176---PROGRAMA-O-I---T02-2025.1-',
    demo_url = '',
    content = '# Password Generator: Cryptographic CLI Utility

A high-performance C++ utility for generating cryptographically robust passwords and passphrases with real-time Shannon entropy benchmarking.

## System Overview
Engineered as a secure command-line tool, this utility produces high-entropy credentials and mnemonic passphrases designed to resist brute-force iterations, rainbow table attacks, and dictionary attacks.

## Cryptographic Principles & Security Design
- **Cryptographic Random Sampling:** Uses hardware-seeded `std::random_device` combined with `std::mt19937_64` pseudorandom engines leveraging system entropy sources (`/dev/urandom`).
- **Shannon Entropy Metric:** Computes theoretical entropy in bits in real-time:
  $$\text{Entropy} = L \times log_2(R)$$
  where $L$ denotes string length and $R$ represents the active character pool cardinality.
- **Configurable Character Sets:** Flexible filtering for uppercase, lowercase, numeric digits, non-alphanumeric symbols, and exclusion of visually ambiguous glyphs (e.g., `0`, `O`, `l`, `1`).

## Passphrase Generation
Features Diceware-style passphrase generation from validated dictionary wordlists, delivering exceptional cryptographic entropy while maintaining human memorability.

<!-- BILINGUAL_SPLIT -->

# Password Generator em C++

Utilitário criptográfico para geração de senhas e passphrases com cálculo em tempo real de bits de entropia de Shannon.

## Visão Geral
Ferramenta de linha de comando em C++ focada na geração segura de senhas criptograficamente fortes e passphrases mnemônicas resistentes a ataques de força bruta e ataques baseados em dicionários.

## Princípios Criptográficos & Segurança
- **Geração Pseudoaleatória Segura:** Uso de `std::random_device` combinado com geradores `std::mt19937_64` com sementes de alta entropia obtidas do sistema operacional (`/dev/urandom`).
- **Cálculo da Entropia de Shannon:** Medição matemática em tempo real da incerteza e força da senha gerada:
  $$\text{Entropia} = L \times log_2(R)$$
  onde $L$ é o comprimento da senha e $R$ é o tamanho do conjunto de caracteres selecionados.
- **Conjuntos Configuráveis:** Suporte a caracteres alfabéticos maiúsculos, minúsculos, dígitos numéricos, símbolos especiais e exclusão de caracteres ambíguos (ex: `0`, `O`, `l`, `1`).

## Modo Passphrase
Possibilita a geração de combinações de palavras aleatórias baseadas em listas estruturadas (estilo Diceware), garantindo alta entropia e facilidade de memorização pelo usuário humano.',
    updated_at = timezone('utc'::text, now())
WHERE id = 'password-generator';


-- 2. ATUALIZAÇÃO DA TABELA 'experiences'

-- Experiência: exp-detran
UPDATE public.experiences
SET
    title = 'IT Intern <!-- BILINGUAL_SPLIT --> Estagiário de TI',
    company = 'Detran',
    time = 'June 2026 - Present <!-- BILINGUAL_SPLIT --> Junho 2026 - Atualmente',
    bullets = ARRAY['Design, develop, and implement software systems to meet agency requirements; <!-- BILINGUAL_SPLIT --> Projetar, desenvolver e implementar softwares para atender as necessidades do Órgão;', 'Applying modern programming techniques and agile project management practices; <!-- BILINGUAL_SPLIT --> Utilizando técnicas de programação e gestão de projetos;', 'Conduct system requirements analysis and specifications; <!-- BILINGUAL_SPLIT --> Desenvolver análise de requisitos;', 'Develop mobile application initiatives. <!-- BILINGUAL_SPLIT --> Desenvolver projetos para aplicativo mobile.']::TEXT[],
    updated_at = timezone('utc'::text, now())
WHERE id = 'exp-detran';

-- Experiência: exp-cachina
UPDATE public.experiences
SET
    title = 'IT Intern <!-- BILINGUAL_SPLIT --> Estagiário de TI',
    company = 'Cachina Soluções',
    time = 'March 2026 - July 2026 <!-- BILINGUAL_SPLIT --> Março 2026 - Julho 2026',
    bullets = ARRAY['Backend architecture development and optimization; <!-- BILINGUAL_SPLIT --> Desenvolvimento e otimização de arquiteturas de backend;', 'Intelligent workflow automation using n8n integrated into digital ecosystems; <!-- BILINGUAL_SPLIT --> Automação de fluxos de trabalho inteligentes utilizando n8n integrados a ecossistemas digitais;', 'Agile Linux server management (Ubuntu Server) and technical documentation of operational procedures; <!-- BILINGUAL_SPLIT --> Gerenciamento ágil de servidores Linux (Ubuntu Server) e documentação técnica de processos operacionais;', 'Core technologies: Python, SQL, n8n, Linux, Bash, and Git. <!-- BILINGUAL_SPLIT --> Principais tecnologias utilizadas: Python, SQL, n8n, Linux, Bash e Git.']::TEXT[],
    updated_at = timezone('utc'::text, now())
WHERE id = 'exp-cachina';

-- Experiência: exp-ufrn
UPDATE public.experiences
SET
    title = 'Bachelor of Science in Information Technology (BTI) <!-- BILINGUAL_SPLIT --> Bacharelado em Tecnologia da Informação (BTI)',
    company = 'UFRN - Campus Natal',
    time = '2024.1 - Present <!-- BILINGUAL_SPLIT --> 2024.1 - Presente',
    bullets = ARRAY['Currently in 6th semester; <!-- BILINGUAL_SPLIT --> Cursando o 6º período;', 'Strong academic foundation in algorithms, advanced data structures, applied statistics, and linear algebra; <!-- BILINGUAL_SPLIT --> Sólida base acadêmica em algoritmos, estruturas de dados avançadas, estatística e álgebra linear aplicadas;', 'Active focus in MLOps, Deep Learning, Reinforcement Learning, and High Performance Computing. <!-- BILINGUAL_SPLIT --> Foco em andamento nas áreas de MLOps, Deep Learning, Aprendizado por Reforço e Computação de Alto Desempenho.']::TEXT[],
    updated_at = timezone('utc'::text, now())
WHERE id = 'exp-ufrn';

-- Experiência: exp-ifrn
UPDATE public.experiences
SET
    title = 'IT Technician Training <!-- BILINGUAL_SPLIT --> Formação Técnica em TI',
    company = 'IFRN Campus Lajes',
    time = '2019 - 2022',
    bullets = ARRAY['Integrated vocational education focused on Web Development; <!-- BILINGUAL_SPLIT --> Formação técnica integrada estruturada com foco em Desenvolvimento web;', 'Solid algorithmic problem-solving and relational database fundamentals; <!-- BILINGUAL_SPLIT --> Desenvolvimento de lógica algorítmica sólida e fundamentos de bancos de dados relacionais;', 'Hands-on lab experience with assembly, maintenance, and deployment of local operational architectures. <!-- BILINGUAL_SPLIT --> Práticas de laboratório envolvendo montagem, manutenção e implantação de arquiteturas operacionais locais.']::TEXT[],
    updated_at = timezone('utc'::text, now())
WHERE id = 'exp-ifrn';


-- 3. ATUALIZAÇÃO DA TABELA 'thoughts'

-- Pensamento: th-1
UPDATE public.thoughts
SET
    title = 'The Intersection Between Hyperrealism in Drawing and Software Engineering <!-- BILINGUAL_SPLIT --> A Intersecção entre Hiper-realismo no Desenho e Engenharia de Software',
    about_context = 'Personal essay on focus, patience, and meticulous attention to detail. <!-- BILINGUAL_SPLIT --> Ensaio pessoal sobre foco, paciência e atenção aos mínimos detalhes.',
    content = '# The Intersection Between Hyperrealism in Drawing and Software Engineering

In hyperrealism, you don''t merely draw an eye; you draw every gradient of light reflected on the iris, every micro-texture of the skin, and every subtle ambient occlusion shadow.

In software engineering and the training of neural networks, the principle is identical: excellence never arises from luck, but from the cumulative sum of consistent, millimetric refinements.


<!-- BILINGUAL_SPLIT -->

# A Intersecção entre Hiper-realismo no Desenho e Engenharia de Software

No hiper-realismo, você não desenha um olho; você desenha cada gradiente de luz refletido na íris, cada micro-textura da pele e cada sombra de oclusão.

Na engenharia de software e no treinamento de redes neurais, o princípio é idêntico: a excelência não surge de um golpe de sorte, mas da soma milimétrica de refinamentos consistentes.
',
    updated_at = timezone('utc'::text, now())
WHERE id = 'th-1';
