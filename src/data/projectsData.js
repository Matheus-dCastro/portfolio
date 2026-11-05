// src/data/projectsData.js
// Centralized project and publication data with local storage support

import arte1 from "../assets/img/IMG_2998.webp";
import arte2 from "../assets/img/IMG_3111.webp";
import arte3 from "../assets/img/IMG_3112.webp";
import arte4 from "../assets/img/IMG_3114.webp";
import arte5 from "../assets/img/IMG_3107.webp";
import arte6 from "../assets/img/IMG_3285-convertido-de-jpeg.webp";
import arte7 from "../assets/img/IMG_3104.webp";
import arte8 from "../assets/img/IMG_3110.webp";
import arte9 from "../assets/img/IMG_3286-convertido-de-jpeg.webp";
import capa1 from "../assets/img/1CF53B24-759E-48D5-B0C5-9CA7349A544E.webp";
import capa2 from "../assets/img/566644515_18081743411050733_8226103790257785455_n.webp";
import capa3 from "../assets/img/575981249_18291228211272949_514477677943118836_n.webp";
import capa4 from "../assets/img/584385202_18086409646964312_3912764164389240104_n.webp";
import capa5 from "../assets/img/Gama-4.webp";
import capa6 from "../assets/img/IMG_3091.webp";

export const DEFAULT_PROJECTS = [
  {
    id: "agentmetrics",
    title: "AgentMetrics",
    titleEn: "AgentMetrics",
    titlePt: "AgentMetrics",
    category: "Profissional",
    tags: ["FastAPI", "Data & ML", "Python", "Docker"],
    shortDescription: "Intelligent telemetry API built to monitor resource consumption and benchmark AI agent performance in real-time.",
    shortDescriptionEn: "Intelligent telemetry API built to monitor resource consumption and benchmark AI agent performance in real-time.",
    shortDescriptionPt: "API de telemetria inteligente desenvolvida para monitorar o consumo de recursos e metrificar o desempenho de agentes de IA em tempo real.",
    aboutContext: "Monitoring and telemetry system for LLMs and autonomous agents. Collects latency metrics, token consumption, cost per request, and inference throughput in AI clusters.",
    aboutContextEn: "Monitoring and telemetry system for LLMs and autonomous agents. Collects latency metrics, token consumption, cost per request, and inference throughput in AI clusters.",
    aboutContextPt: "Sistema de monitoramento e telemetria para LLMs e agentes autônomos. Coleta métricas de latência, consumo de tokens, custo por requisição e vazão de inferência em clusters de IA.",
    github: "https://github.com/Matheus-dCastro/AgentMetrics",
    demo: "",
    relatedArticleId: "art-1",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2026-03-15",
    content: `# AgentMetrics: Telemetry for Autonomous AI Agents

A robust telemetry and observability platform engineered to monitor LLM-based autonomous agents in production environments.

## Overview & Problem Statement
As artificial intelligence agents are integrated into enterprise business processes, real-time tracking of token consumption, inference latency, and answer correctness becomes essential. AgentMetrics addresses these operational challenges with an asynchronous, event-driven telemetry architecture.

## Architecture and Tech Stack
- **FastAPI (Python 3.11):** High-throughput backend using native asynchronous endpoints (\`async/await\`).
- **PostgreSQL & TimescaleDB:** Optimized time-series storage engine for low-latency metric ingestion and aggregation.
- **Docker & Docker Compose:** Complete containerization of services ensuring reproducible local and staging environments.
- **Pydantic v2:** Strict runtime data validation and contract enforcement across all telemetry ingestion pipelines.

## Monitored Metrics
1. **Time to First Token (TTFT):** Initial perceived latency from prompt dispatch to the first streaming chunk.
2. **Hallucination & Conformance Rate:** Heuristic evaluation combined with synthetic LLM judge benchmarks.
3. **Memory & VRAM Utilization:** Hardware profiling during local and distributed inference passes.
4. **Estimated Cost Per Session:** Real-time billing computation based on input, output, and cached token tiers.

\`\`\`python
# Example of agent instrumentation with AgentMetrics
from agentmetrics import telemetry, MetricContext

@telemetry.trace(agent_name="qwen-coder-32b")
async def process_prompt(prompt: str) -> str:
    with MetricContext.track_tokens() as tracker:
        response = await llm_engine.generate(prompt)
        tracker.record(model="qwen-2.5", tags=["dev", "backend"])
    return response
\`\`\`

## Running Locally
\`\`\`bash
# Clone the repository
git clone https://github.com/Matheus-dCastro/AgentMetrics.git
cd AgentMetrics

# Launch stack with Docker
docker-compose up --build
\`\`\``,
    contentEn: `# AgentMetrics: Telemetry for Autonomous AI Agents

A robust telemetry and observability platform engineered to monitor LLM-based autonomous agents in production environments.

## Overview & Problem Statement
As artificial intelligence agents are integrated into enterprise business processes, real-time tracking of token consumption, inference latency, and answer correctness becomes essential. AgentMetrics addresses these operational challenges with an asynchronous, event-driven telemetry architecture.

## Architecture and Tech Stack
- **FastAPI (Python 3.11):** High-throughput backend using native asynchronous endpoints (\`async/await\`).
- **PostgreSQL & TimescaleDB:** Optimized time-series storage engine for low-latency metric ingestion and aggregation.
- **Docker & Docker Compose:** Complete containerization of services ensuring reproducible local and staging environments.
- **Pydantic v2:** Strict runtime data validation and contract enforcement across all telemetry ingestion pipelines.

## Monitored Metrics
1. **Time to First Token (TTFT):** Initial perceived latency from prompt dispatch to the first streaming chunk.
2. **Hallucination & Conformance Rate:** Heuristic evaluation combined with synthetic LLM judge benchmarks.
3. **Memory & VRAM Utilization:** Hardware profiling during local and distributed inference passes.
4. **Estimated Cost Per Session:** Real-time billing computation based on input, output, and cached token tiers.

\`\`\`python
# Example of agent instrumentation with AgentMetrics
from agentmetrics import telemetry, MetricContext

@telemetry.trace(agent_name="qwen-coder-32b")
async def process_prompt(prompt: str) -> str:
    with MetricContext.track_tokens() as tracker:
        response = await llm_engine.generate(prompt)
        tracker.record(model="qwen-2.5", tags=["dev", "backend"])
    return response
\`\`\`

## Running Locally
\`\`\`bash
# Clone the repository
git clone https://github.com/Matheus-dCastro/AgentMetrics.git
cd AgentMetrics

# Launch stack with Docker
docker-compose up --build
\`\`\``,
    contentPt: `# AgentMetrics: Telemetria de Agentes Autônomos de IA

Uma solução robusta de telemetria e observabilidade desenvolvida para monitorar agentes baseados em LLMs em ambientes de produção.

## Problema & Visão Geral
À medida que agentes de inteligência artificial são integrados a rotinas corporativas, torna-se crítico rastrear o consumo de tokens, os tempos de inferência e a assertividade das respostas. O AgentMetrics resolve isso com uma arquitetura assíncrona orientada a eventos.

## Arquitetura e Tecnologias
- **FastAPI (Python 3.11):** Backend de alta performance com endpoints assíncronos (\`async/await\`).
- **PostgreSQL & TimescaleDB:** Armazenamento otimizado para séries temporais de métricas.
- **Docker & Docker Compose:** Conteinerização de todos os serviços para reprodutibilidade.
- **Pydantic v2:** Validação estrita de contratos de dados em tempo de execução.

## Métricas Monitoradas
1. **Time to First Token (TTFT):** Latência inicial percebida pelo usuário.
2. **Taxa de Alucinação / Conformidade:** Avaliação heurística e por juiz sintético.
3. **Consumo de Memória e VRAM:** Uso de recursos computacionais durante inferências locais e remotas.
4. **Custo Estimado por Sessão:** Metrificação de gastos com tokens de entrada e saída.

\`\`\`python
# Exemplo de instrumentação de agente com AgentMetrics
from agentmetrics import telemetry, MetricContext

@telemetry.trace(agent_name="qwen-coder-32b")
async def process_prompt(prompt: str) -> str:
    with MetricContext.track_tokens() as tracker:
        response = await llm_engine.generate(prompt)
        tracker.record(model="qwen-2.5", tags=["dev", "backend"])
    return response
\`\`\`

## Como Executar Localmente
\`\`\`bash
# Clone o repositório
git clone https://github.com/Matheus-dCastro/AgentMetrics.git
cd AgentMetrics

# Suba a stack com Docker
docker-compose up --build
\`\`\``
  },
  {
    id: "medical-segmentation",
    title: "Medical Image Segmentation",
    titleEn: "Medical Image Segmentation",
    titlePt: "Segmentação de Imagens Médicas",
    category: "Acadêmico",
    tags: ["Deep Learning", "Python", "PyTorch", "U-Net"],
    shortDescription: "Supervised Deep Learning pipeline for pixel-level semantic segmentation of medical imaging structures using U-Net architecture.",
    shortDescriptionEn: "Supervised Deep Learning pipeline for pixel-level semantic segmentation of medical imaging structures using U-Net architecture.",
    shortDescriptionPt: "Pipeline de Deep Learning supervisionado para segmentação pixel a pixel de estruturas e lesões em imagens médicas utilizando arquitetura U-Net.",
    aboutContext: "Academic research and practical implementation of convolutional networks and U-Net architecture for semantic segmentation of CT and MRI scans.",
    aboutContextEn: "Academic research and practical implementation of convolutional networks and U-Net architecture for semantic segmentation of CT and MRI scans.",
    aboutContextPt: "Pesquisa acadêmica e aplicação prática de redes convolucionais e arquitetura U-Net para segmentação semântica de exames de tomografia e ressonância magnética.",
    github: "https://github.com/Matheus-dCastro/Projeto-de-AM-Supervisionado",
    demo: "",
    relatedArticleId: "art-2",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2026-02-10",
    content: `# Medical Image Segmentation with U-Net Architecture

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
- OpenCV & Matplotlib for Analysis`,
    contentEn: `# Medical Image Segmentation with U-Net Architecture

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
- OpenCV & Matplotlib for Analysis`,
    contentPt: `# Medical Image Segmentation com Arquitetura U-Net

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
- OpenCV & Matplotlib`
  },
  {
    id: "obsidian-neon-theme",
    title: "Obsidian Neon Theme",
    titleEn: "Obsidian Neon Theme",
    titlePt: "Obsidian Neon Theme",
    category: "Pessoal",
    tags: ["VS Code Theme", "UI & Design", "JSON", "Design System"],
    shortDescription: "High-contrast neon theme and visual design system for VS Code featuring refined semantic syntax highlighting.",
    shortDescriptionEn: "High-contrast neon theme and visual design system for VS Code featuring refined semantic syntax highlighting.",
    shortDescriptionPt: "Tema e suíte visual para VS Code com paletas neon de alto contraste, ícones customizados e realce de sintaxe semântico refinado.",
    aboutContext: "Visual Studio Code Marketplace published extension designed with visual ergonomics for developers coding in low-light environments.",
    aboutContextEn: "Visual Studio Code Marketplace published extension designed with visual ergonomics for developers coding in low-light environments.",
    aboutContextPt: "Extensão publicada no Visual Studio Code Marketplace projetada com ergonomia visual para programadores que passam longas horas codificando em ambientes de baixa luminosidade.",
    github: "https://github.com/Matheus-dCastro/obsidian-neon-thema",
    demo: "https://marketplace.visualstudio.com/items?itemName=Alomyr.obsidian-neon-110",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2026-01-20",
    content: `# Obsidian Neon Theme for Visual Studio Code

A refined cyberpunk-aesthetic dark theme engineered for exceptional legibility and reduced ocular fatigue during long nocturnal coding sessions.

## Design Philosophy
Drawing inspiration from the micrometric precision of hyperrealistic graphite drawing and the energetic contrast of glowing neon interfaces, Obsidian Neon pairs ultra-deep charcoal foundations (#030306 and #08080c) with luminous violet and electric cyan accents.

- **Semantic Token Clarity:** Immediate cognitive distinction between primitive types, control-flow statements, object attributes, and method invocations.
- **WCAG AAA Compliance:** High-contrast ratios exceeding 7:1 across all active syntax scopes, protecting ocular health.
- **Polyglot Syntax Grammar:** Custom-tuned token scopes for Python, C++, Rust, TypeScript, Java, and Markdown.

## Installation
In Visual Studio Code, press \`Ctrl+P\` (or \`Cmd+P\` on macOS) and run:
\`\`\`bash
ext install Alomyr.obsidian-neon-110
\`\`\``,
    contentEn: `# Obsidian Neon Theme for Visual Studio Code

A refined cyberpunk-aesthetic dark theme engineered for exceptional legibility and reduced ocular fatigue during long nocturnal coding sessions.

## Design Philosophy
Drawing inspiration from the micrometric precision of hyperrealistic graphite drawing and the energetic contrast of glowing neon interfaces, Obsidian Neon pairs ultra-deep charcoal foundations (#030306 and #08080c) with luminous violet and electric cyan accents.

- **Semantic Token Clarity:** Immediate cognitive distinction between primitive types, control-flow statements, object attributes, and method invocations.
- **WCAG AAA Compliance:** High-contrast ratios exceeding 7:1 across all active syntax scopes, protecting ocular health.
- **Polyglot Syntax Grammar:** Custom-tuned token scopes for Python, C++, Rust, TypeScript, Java, and Markdown.

## Installation
In Visual Studio Code, press \`Ctrl+P\` (or \`Cmd+P\` on macOS) and run:
\`\`\`bash
ext install Alomyr.obsidian-neon-110
\`\`\``,
    contentPt: `# Obsidian Neon Theme para Visual Studio Code

Tema com estética cyberpunk refinada, focado em alta legibilidade sem fadiga visual para sessões noturnas de código.

## Filosofia de Design
Inspirado na precisão do traço do hiper-realismo e no contraste dinâmico de interfaces neons, o Obsidian Neon equilibra tons escuros profundos (#030306 e #08080c) com acentos violetas luminosos e ciano elétrico.

- **Tokens Semânticos Claros:** Diferenciação visual imediata entre tipos primitivos, palavras-chave de controle de fluxo e chamadas de métodos.
- **Contraste WCAG AAA:** Mais de 7:1 de proporção de contraste em todo o código fonte.
- **Suporte Multilinguagem:** Otimizado para Python, C++, Rust, TypeScript, Java e Markdown.

## Instalação
No VS Code, abra a paleta de comandos (\`Ctrl+P\` ou \`Cmd+P\`) e execute:
\`\`\`bash
ext install Alomyr.obsidian-neon-110
\`\`\``
  },
  {
    id: "cachina-solucoes",
    title: "Cachina Solutions",
    titleEn: "Cachina Solutions",
    titlePt: "Cachina Soluções",
    category: "Profissional",
    tags: ["Automation & Web", "n8n", "Linux", "Bash"],
    shortDescription: "Development and infrastructure hosting for corporate digital ecosystems and strategic workflow automation.",
    shortDescriptionEn: "Development and infrastructure hosting for corporate digital ecosystems and strategic workflow automation.",
    shortDescriptionPt: "Desenvolvimento e hospedagem do ecossistema de interfaces e apresentação estratégica corporativa.",
    aboutContext: "Corporate platform and intelligent workflow automation implemented for Cachina Soluções.",
    aboutContextEn: "Corporate platform and intelligent workflow automation implemented for Cachina Soluções.",
    aboutContextPt: "Plataforma corporativa e automação de processos inteligentes implementada para a empresa Cachina Soluções.",
    github: "https://github.com/Matheus-dCastro/Site-Cachina-2026",
    demo: "https://cachina.com.br/",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2026-02-28",
    content: `# Cachina Solutions: Digital Ecosystem & Automation

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
- Automated snapshot backups and proactive service health monitoring.`,
    contentEn: `# Cachina Solutions: Digital Ecosystem & Automation

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
- Automated snapshot backups and proactive service health monitoring.`,
    contentPt: `# Cachina Soluções: Ecossistema Digital & Automação

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
- Políticas de backup periódico automatizado e monitoramento contínuo de uptime.`
  },
  {
    id: "task-system-cli",
    title: "Task System CLI",
    titleEn: "Task System CLI",
    titlePt: "Task System CLI",
    category: "Pessoal",
    tags: ["Python & SQL", "PostgreSQL", "MVC", "CLI"],
    shortDescription: "Complete MVC architecture with PostgreSQL persistence for high-efficiency terminal-based task workflows.",
    shortDescriptionEn: "Complete MVC architecture with PostgreSQL persistence for high-efficiency terminal-based task workflows.",
    shortDescriptionPt: "Arquitetura MVC completa com persistência em PostgreSQL para controle eficiente de fluxos de trabalho via terminal.",
    aboutContext: "Python CLI application strictly implementing Model-View-Controller design patterns with relational persistence.",
    aboutContextEn: "Python CLI application strictly implementing Model-View-Controller design patterns with relational persistence.",
    aboutContextPt: "Aplicativo CLI desenvolvido em Python seguindo rigorosamente os padrões de projeto MVC com persistência relacional.",
    github: "https://github.com/Matheus-dCastro/Sistema-de-Controle-em-Py3",
    demo: "",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2025-11-12",
    content: `# Task System CLI: Terminal Productivity Suite

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
\`\`\`bash
# List pending tasks with high priority
task-cli list --status pending --priority high

# Complete a task by ID
task-cli complete --id 42
\`\`\``,
    contentEn: `# Task System CLI: Terminal Productivity Suite

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
\`\`\`bash
# List pending tasks with high priority
task-cli list --status pending --priority high

# Complete a task by ID
task-cli complete --id 42
\`\`\``,
    contentPt: `# Task System CLI: Gestão Produtiva no Terminal

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
\`\`\`bash
# Listar tarefas pendentes com alta prioridade
task-cli list --status pending --priority high

# Marcar tarefa como concluída
task-cli complete --id 42
\`\`\``
  },
  {
    id: "timemaster",
    title: "TimeMaster",
    titleEn: "TimeMaster",
    titlePt: "TimeMaster",
    category: "Acadêmico",
    tags: ["Java", "OOP", "LP2", "Design Patterns"],
    shortDescription: "Modular Java backend system for complex appointment scheduling and calendar conflict resolution.",
    shortDescriptionEn: "Modular Java backend system for complex appointment scheduling and calendar conflict resolution.",
    shortDescriptionPt: "Sistema modular backend para gerenciamento de compromissos e agendamentos complexos desenvolvido em LP2.",
    aboutContext: "Academic Programming Language 2 project exploring pure object-oriented design, design patterns, and robust exception handling.",
    aboutContextEn: "Academic Programming Language 2 project exploring pure object-oriented design, design patterns, and robust exception handling.",
    aboutContextPt: "Projeto acadêmico de Linguagem de Programação 2 explorando programação orientada a objetos pura, padrões de projeto e tratamento robusto de exceções.",
    github: "https://github.com/Matheus-dCastro/Sistema-de-Agenda-de-Compromissos.git",
    demo: "",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2025-06-20",
    content: `# TimeMaster: Java Appointment Scheduling Engine

Modular Java scheduling system architected with immutable value classes for robust time-interval calculations and automated calendar collision resolution.

## System Overview
Developed as an academic project in Programming Language 2 (LP2), TimeMaster demonstrates pure Object-Oriented Programming (OOP) principles in modern Java, emphasizing immutability, design patterns, and enterprise exception handling.

## Design Patterns & Core Architecture
- **Immutable Value Objects:** Encapsulation of \`TimeInterval\` and \`AppointmentDate\` records preventing race conditions and unintentional side-effects in concurrent execution environments.
- **Factory Pattern:** Controlled instantiation of appointment entities with strict boundary assertions (start time strictly preceding end time, operating business hours validation).
- **Strategy Pattern:** Pluggable resolution algorithms for handling scheduling collisions (rejection strategy, next-available-slot allocation, and alternative slot recommendation).
- **Domain Exception Hierarchy:** Explicit custom exceptions such as \`TimeConflictException\` and \`InvalidSlotException\` enabling clean error propagation and boundary handling.

## Core Features
1. **Collision Detection:** Efficient overlapping interval evaluation executing in O(log n) time using balanced search indices.
2. **Recurrence Engine:** Scheduling support for daily, weekly, and custom interval patterns with leap-year and variable-month corrections.
3. **Repository Abstraction:** Decoupled persistence interface supporting in-memory storage and structured file serialization.`,
    contentEn: `# TimeMaster: Java Appointment Scheduling Engine

Modular Java scheduling system architected with immutable value classes for robust time-interval calculations and automated calendar collision resolution.

## System Overview
Developed as an academic project in Programming Language 2 (LP2), TimeMaster demonstrates pure Object-Oriented Programming (OOP) principles in modern Java, emphasizing immutability, design patterns, and enterprise exception handling.

## Design Patterns & Core Architecture
- **Immutable Value Objects:** Encapsulation of \`TimeInterval\` and \`AppointmentDate\` records preventing race conditions and unintentional side-effects in concurrent execution environments.
- **Factory Pattern:** Controlled instantiation of appointment entities with strict boundary assertions (start time strictly preceding end time, operating business hours validation).
- **Strategy Pattern:** Pluggable resolution algorithms for handling scheduling collisions (rejection strategy, next-available-slot allocation, and alternative slot recommendation).
- **Domain Exception Hierarchy:** Explicit custom exceptions such as \`TimeConflictException\` and \`InvalidSlotException\` enabling clean error propagation and boundary handling.

## Core Features
1. **Collision Detection:** Efficient overlapping interval evaluation executing in O(log n) time using balanced search indices.
2. **Recurrence Engine:** Scheduling support for daily, weekly, and custom interval patterns with leap-year and variable-month corrections.
3. **Repository Abstraction:** Decoupled persistence interface supporting in-memory storage and structured file serialization.`,
    contentPt: `# TimeMaster: Gestão de Agendamentos em Java

Arquitetura modular em Java com classes imutáveis para cálculo de intervalos de tempo e resolução automática de conflitos em calendários.

## Visão Geral do Sistema
O TimeMaster foi desenvolvido na disciplina de Linguagem de Programação 2 (LP2) com o objetivo de demonstrar os princípios fundamentais da Orientação a Objetos em Java moderno, aplicando padrões de projeto consolidados e evitando armadilhas clássicas de mutabilidade temporal.

## Padrões de Projeto & Arquitetura
- **Objetos de Valor Imutáveis:** Representação de intervalos (\`TimeInterval\`) e datas (\`AppointmentDate\`) utilizando registros ou classes finais imutáveis, prevenindo efeitos colaterais em ambientes multithread.
- **Factory Pattern:** Instanciação controlada de compromissos com regras de validação estritas (horário de início anterior ao horário de término, dias úteis e janelas de atendimento).
- **Strategy Pattern:** Algoritmos intercambiáveis para detecção e resolução de colisões de agendamento (estratégia de recusa imediata, estratégia de alocação no próximo horário disponível e sugestão de reagendamento).
- **Hierarquia de Exceções Personalizadas:** Lançamento de exceções específicas como \`TimeConflictException\` e \`InvalidSlotException\`, simplificando o tratamento de erros na camada de controle.

## Funcionalidades
1. **Validação de Sobreposição:** Detecção instantânea de intervalos concorrentes com complexidade O(log n).
2. **Recorrência Flexível:** Agendamentos diários, semanais e mensais com tratamento de meses com diferentes números de dias e anos bissextos.
3. **Persistência Modular:** Abstração de repositório permitindo armazenamento em memória ou serialização de arquivos.`
  },
  {
    id: "zombie-dice",
    title: "Zombie Dice",
    titleEn: "Zombie Dice",
    titlePt: "Zombie Dice",
    category: "Acadêmico",
    tags: ["C++", "OOP", "State Machine", "CLI Game"],
    shortDescription: "Object-oriented implementation and finite state machine for a terminal-based dice strategy game.",
    shortDescriptionEn: "Object-oriented implementation and finite state machine for a terminal-based dice strategy game.",
    shortDescriptionPt: "Implementação orientada a objetos e máquina de estados para execução de jogo de dados lógico via terminal CLI.",
    aboutContext: "Probabilistic strategy game implemented in modern C++ with manual memory management and state machine design.",
    aboutContextEn: "Probabilistic strategy game implemented in modern C++ with manual memory management and state machine design.",
    aboutContextPt: "Jogo de estratégia probabilística implementado em C++ com gerenciamento manual de memória e máquina de estados finitos.",
    github: "https://github.com/Matheus-dCastro/trabalho-06-projeto-zombie-dice-Turma-DIM0176---PROGRAMA-O-I---T02-2025.1-.git",
    demo: "",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2025-05-15",
    content: `# Zombie Dice: Modern C++ Game Engine

A full-featured C++ implementation of the Push-Your-Luck dice game featuring a finite state machine architecture and statistical risk-assessment algorithms.

## Game Overview
Zombie Dice is a renowned turn-based dice game exploring decision-making under uncertainty. This modern C++ implementation translates the official game dynamics into an elegant, object-oriented framework driven by a robust Finite State Machine (FSM).

## Software Architecture
- **Finite State Machine (FSM):** Strict state transitions (\`TurnStart\`, \`DiceRolling\`, \`DecisionWait\`, \`TurnEnd\`, \`GameOver\`) enforcing valid gameplay progression and eliminating illegal actions.
- **Modern RAII & Memory Safety:** Idiomatic utilization of \`std::unique_ptr\`, \`std::vector\`, and standard algorithms to ensure zero resource leaks without manual pointer arithmetic.
- **Stochastic Cup Model:** Precise physical simulation of the 13-dice dice cup (6 green, 4 yellow, 3 red) with weighted face distributions for brains, footprints, and shotgun blasts.

## Push-Your-Luck Heuristic
Includes an automated analytical engine evaluating risk-versus-reward probabilities based on shotgun wound counts, dice remaining in the cup, and overall victory thresholds to guide optimal stop-or-roll decisions.`,
    contentEn: `# Zombie Dice: Modern C++ Game Engine

A full-featured C++ implementation of the Push-Your-Luck dice game featuring a finite state machine architecture and statistical risk-assessment algorithms.

## Game Overview
Zombie Dice is a renowned turn-based dice game exploring decision-making under uncertainty. This modern C++ implementation translates the official game dynamics into an elegant, object-oriented framework driven by a robust Finite State Machine (FSM).

## Software Architecture
- **Finite State Machine (FSM):** Strict state transitions (\`TurnStart\`, \`DiceRolling\`, \`DecisionWait\`, \`TurnEnd\`, \`GameOver\`) enforcing valid gameplay progression and eliminating illegal actions.
- **Modern RAII & Memory Safety:** Idiomatic utilization of \`std::unique_ptr\`, \`std::vector\`, and standard algorithms to ensure zero resource leaks without manual pointer arithmetic.
- **Stochastic Cup Model:** Precise physical simulation of the 13-dice dice cup (6 green, 4 yellow, 3 red) with weighted face distributions for brains, footprints, and shotgun blasts.

## Push-Your-Luck Heuristic
Includes an automated analytical engine evaluating risk-versus-reward probabilities based on shotgun wound counts, dice remaining in the cup, and overall victory thresholds to guide optimal stop-or-roll decisions.`,
    contentPt: `# Zombie Dice em C++ Moderno

Implementação completa das regras do jogo com simulação estatística de probabilidades de rolagem e inteligência para decisão de parada (Push Your Luck).

## Visão Geral do Jogo
Zombie Dice é um clássico jogo de dados e tomada de decisão sob incerteza. Nesta implementação em C++ moderno, todo o fluxo de regras foi modelado com uma arquitetura orientada a objetos limpa e uma máquina de estados finitos que gerencia os turnos e a pontuação dos jogadores.

## Arquitetura de Software
- **Máquina de Estados Finitos (FSM):** Estados bem delimitados (\`TurnStart\`, \`DiceRolling\`, \`DecisionWait\`, \`TurnEnd\`, \`GameOver\`), garantindo transições determinísticas e evitando estados inconsistentes.
- **Gerenciamento de Memória & RAII:** Uso rigoroso de \`std::unique_ptr\` e \`std::vector\`, eliminando alocações manuais de memória e prevenindo vazamentos de recursos.
- **Modelo de Dados Probabilístico:** O copo contém 13 dados com diferentes distribuições de faces (6 verdes, 4 amarelos e 3 vermelhos), simulando com precisão a probabilidade estatística de obtenção de cérebros, pegadas ou tiros.

## Módulo Heurístico de Parada
O jogo conta com um algoritmo heurístico para agentes controlados pelo computador, calculando a razão risco-recompensa baseando-se no número de tiros acumulados e na quantidade de dados restantes no copo para determinar se o jogador deve continuar rolando ou garantir os pontos conquistados.`
  },
  {
    id: "projeto-snaze",
    title: "Snaze Project",
    titleEn: "Snaze Project",
    titlePt: "Projeto Snaze",
    category: "Acadêmico",
    tags: ["Game in CPP", "C++", "Algorithms", "Pathfinding"],
    shortDescription: "Autonomous pathfinding simulation guiding an intelligent snake through dynamic mazes using graph search algorithms.",
    shortDescriptionEn: "Autonomous pathfinding simulation guiding an intelligent snake through dynamic mazes using graph search algorithms.",
    shortDescriptionPt: "Simulação computacional onde o programa guia uma serpente inteligente através de um labirinto até o alimento com algoritmos de busca.",
    aboutContext: "Programming I academic project featuring graph representations, sparse matrices, and Breadth-First Search (BFS).",
    aboutContextEn: "Programming I academic project featuring graph representations, sparse matrices, and Breadth-First Search (BFS).",
    aboutContextPt: "Trabalho acadêmico de Programação I envolvendo representação de grafos, matrizes espparsas e busca em largura (BFS).",
    github: "https://github.com/Matheus-dCastro/trabalho-07-projeto-snaze--Turma-DIM0176---PROGRAMA-O-I---T02-2025.1-.git",
    demo: "",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2025-04-30",
    content: `# Snaze Project: Autonomous Maze Pathfinding

Autonomous maze-navigation simulation written in modern C++ guiding an intelligent agent through dynamic labyrinths using graph search algorithms.

## Project Overview
The Snaze Project is an algorithmic simulation in C++ where an autonomous agent (snake) navigates dynamic grid mazes, dodging fixed obstacles, boundaries, and its own elongating body to reach designated food targets.

## Algorithmic Foundation
- **Breadth-First Search (BFS):** Employs BFS over an unweighted 2D grid graph starting from the snake's head, guaranteeing the discovery of the mathematically shortest route to the objective.
- **Spatial Grid Representation:** Memory-efficient 2D map representation allowing constant-time O(1) collision detection and boundary checks.
- **Survival Fallback Heuristics:** When food targets become temporarily unreachable or the shortest path creates a dead-end trap, the agent switches to a survival mode targeting the largest accessible open partition.

## Data Structures
- \`std::queue\` for standard FIFO node exploration in the BFS graph traversal.
- Double-ended queue (\`std::deque\`) for snake body segments, achieving O(1) head prepends and tail removals.`,
    contentEn: `# Snaze Project: Autonomous Maze Pathfinding

Autonomous maze-navigation simulation written in modern C++ guiding an intelligent agent through dynamic labyrinths using graph search algorithms.

## Project Overview
The Snaze Project is an algorithmic simulation in C++ where an autonomous agent (snake) navigates dynamic grid mazes, dodging fixed obstacles, boundaries, and its own elongating body to reach designated food targets.

## Algorithmic Foundation
- **Breadth-First Search (BFS):** Employs BFS over an unweighted 2D grid graph starting from the snake's head, guaranteeing the discovery of the mathematically shortest route to the objective.
- **Spatial Grid Representation:** Memory-efficient 2D map representation allowing constant-time O(1) collision detection and boundary checks.
- **Survival Fallback Heuristics:** When food targets become temporarily unreachable or the shortest path creates a dead-end trap, the agent switches to a survival mode targeting the largest accessible open partition.

## Data Structures
- \`std::queue\` for standard FIFO node exploration in the BFS graph traversal.
- Double-ended queue (\`std::deque\`) for snake body segments, achieving O(1) head prepends and tail removals.`,
    contentPt: `# Projeto Snaze: IA de Busca em Labirinto

Algoritmo de navegação autônoma em labirintos dinâmicos utilizando estruturas de fila e matrizes de adjacência.

## Visão Geral do Projeto
O Projeto Snaze é uma simulação computacional desenvolvida em C++ onde um agente autônomo (serpente) deve navegar por labirintos dinâmicos, desviando de obstáculos, paredes e de seu próprio corpo em crescimento, com o objetivo de alcançar sucessivos itens de comida.

## Fundamentação Algorítmica
- **Busca em Largura (BFS):** O algoritmo de busca em largura explora o grafo de grade não ponderada a partir da cabeça da serpente, garantindo matematicamente o encontro do menor trajeto possível até o alimento.
- **Matriz de Adjacência e Grids Esparsos:** Representação eficiente da topologia do labirinto com verificação de colisões em tempo constante O(1).
- **Heurística de Sobrevivência (Fallback):** Quando o alimento fica temporariamente inacessível ou o trajeto direto resultaria em encurralamento, a serpente ativa uma estratégia heurística de sobrevivência que busca o espaço livre mais amplo para evitar a morte prematura.

## Estruturas de Dados Utilizadas
- \`std::queue\` para expansão dos nós de busca na fila FIFO da BFS.
- Deque circular (\`std::deque\`) para modelagem do corpo da serpente com inserções na cabeça e remoções na cauda em complexidade O(1).`
  },
  {
    id: "password-generator",
    title: "Password Generator",
    titleEn: "Password Generator",
    titlePt: "Password Generator",
    category: "Pessoal",
    tags: ["CPP", "Security", "Entropy", "CLI"],
    shortDescription: "Deterministic and stochastic high-entropy password generator with configurable complexity validation.",
    shortDescriptionEn: "Deterministic and stochastic high-entropy password generator with configurable complexity validation.",
    shortDescriptionPt: "Gerador determinístico e estocástico de senhas de alta entropia com validação de complexidade e tamanho configurável.",
    aboutContext: "C++ security tool focused on secure cryptographic key generation and dictionary-attack resistant passwords.",
    aboutContextEn: "C++ security tool focused on secure cryptographic key generation and dictionary-attack resistant passwords.",
    aboutContextPt: "Ferramenta de segurança em C++ focada em geração segura de chaves criptográficas e senhas resistentes a ataques de dicionário.",
    github: "https://github.com/Matheus-dCastro/trabalho-03-projeto-passgen-Turma-DIM0176---PROGRAMA-O-I---T02-2025.1-",
    demo: "",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2025-03-10",
    content: `# Password Generator: Cryptographic CLI Utility

A high-performance C++ utility for generating cryptographically robust passwords and passphrases with real-time Shannon entropy benchmarking.

## System Overview
Engineered as a secure command-line tool, this utility produces high-entropy credentials and mnemonic passphrases designed to resist brute-force iterations, rainbow table attacks, and dictionary attacks.

## Cryptographic Principles & Security Design
- **Cryptographic Random Sampling:** Uses hardware-seeded \`std::random_device\` combined with \`std::mt19937_64\` pseudorandom engines leveraging system entropy sources (\`/dev/urandom\`).
- **Shannon Entropy Metric:** Computes theoretical entropy in bits in real-time:
  $$\text{Entropy} = L \times log_2(R)$$
  where $L$ denotes string length and $R$ represents the active character pool cardinality.
- **Configurable Character Sets:** Flexible filtering for uppercase, lowercase, numeric digits, non-alphanumeric symbols, and exclusion of visually ambiguous glyphs (e.g., \`0\`, \`O\`, \`l\`, \`1\`).

## Passphrase Generation
Features Diceware-style passphrase generation from validated dictionary wordlists, delivering exceptional cryptographic entropy while maintaining human memorability.`,
    contentEn: `# Password Generator: Cryptographic CLI Utility

A high-performance C++ utility for generating cryptographically robust passwords and passphrases with real-time Shannon entropy benchmarking.

## System Overview
Engineered as a secure command-line tool, this utility produces high-entropy credentials and mnemonic passphrases designed to resist brute-force iterations, rainbow table attacks, and dictionary attacks.

## Cryptographic Principles & Security Design
- **Cryptographic Random Sampling:** Uses hardware-seeded \`std::random_device\` combined with \`std::mt19937_64\` pseudorandom engines leveraging system entropy sources (\`/dev/urandom\`).
- **Shannon Entropy Metric:** Computes theoretical entropy in bits in real-time:
  $$\text{Entropy} = L \times log_2(R)$$
  where $L$ denotes string length and $R$ represents the active character pool cardinality.
- **Configurable Character Sets:** Flexible filtering for uppercase, lowercase, numeric digits, non-alphanumeric symbols, and exclusion of visually ambiguous glyphs (e.g., \`0\`, \`O\`, \`l\`, \`1\`).

## Passphrase Generation
Features Diceware-style passphrase generation from validated dictionary wordlists, delivering exceptional cryptographic entropy while maintaining human memorability.`,
    contentPt: `# Password Generator em C++

Utilitário criptográfico para geração de senhas e passphrases com cálculo em tempo real de bits de entropia de Shannon.

## Visão Geral
Ferramenta de linha de comando em C++ focada na geração segura de senhas criptograficamente fortes e passphrases mnemônicas resistentes a ataques de força bruta e ataques baseados em dicionários.

## Princípios Criptográficos & Segurança
- **Geração Pseudoaleatória Segura:** Uso de \`std::random_device\` combinado com geradores \`std::mt19937_64\` com sementes de alta entropia obtidas do sistema operacional (\`/dev/urandom\`).
- **Cálculo da Entropia de Shannon:** Medição matemática em tempo real da incerteza e força da senha gerada:
  $$\text{Entropia} = L \times log_2(R)$$
  onde $L$ é o comprimento da senha e $R$ é o tamanho do conjunto de caracteres selecionados.
- **Conjuntos Configuráveis:** Suporte a caracteres alfabéticos maiúsculos, minúsculos, dígitos numéricos, símbolos especiais e exclusão de caracteres ambíguos (ex: \`0\`, \`O\`, \`l\`, \`1\`).

## Modo Passphrase
Possibilita a geração de combinações de palavras aleatórias baseadas em listas estruturadas (estilo Diceware), garantindo alta entropia e facilidade de memorização pelo usuário humano.`
  }
];

export const DEFAULT_ARTICLES = [];

export const DEFAULT_THOUGHTS = [
  {
    id: "th-1",
    title: "The Intersection Between Hyperrealism in Drawing and Software Engineering",
    titleEn: "The Intersection Between Hyperrealism in Drawing and Software Engineering",
    titlePt: "A Intersecção entre Hiper-realismo no Desenho e Engenharia de Software",
    category: "Pessoal",
    tags: ["Reflexão", "Design", "Arte", "Código"],
    shortDescription: "How the patience and micrometric observation of graphite drawing shape precision in writing clean code.",
    shortDescriptionEn: "How the patience and micrometric observation of graphite drawing shape precision in writing clean code.",
    shortDescriptionPt: "Como a paciência e a observação micrométrica do desenho a grafite moldam a precisão na escrita de código limpo.",
    aboutContext: "Personal essay on focus, patience, and meticulous attention to detail.",
    aboutContextEn: "Personal essay on focus, patience, and meticulous attention to detail.",
    aboutContextPt: "Ensaio pessoal sobre foco, paciência e atenção aos mínimos detalhes.",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2026-01-05",
    content: `# The Intersection Between Hyperrealism in Drawing and Software Engineering

In hyperrealism, you don't merely draw an eye; you draw every gradient of light reflected on the iris, every micro-texture of the skin, and every subtle ambient occlusion shadow.

In software engineering and the training of neural networks, the principle is identical: excellence never arises from luck, but from the cumulative sum of consistent, millimetric refinements.
`,
    contentEn: `# The Intersection Between Hyperrealism in Drawing and Software Engineering

In hyperrealism, you don't merely draw an eye; you draw every gradient of light reflected on the iris, every micro-texture of the skin, and every subtle ambient occlusion shadow.

In software engineering and the training of neural networks, the principle is identical: excellence never arises from luck, but from the cumulative sum of consistent, millimetric refinements.
`,
    contentPt: `# A Intersecção entre Hiper-realismo no Desenho e Engenharia de Software

No hiper-realismo, você não desenha um olho; você desenha cada gradiente de luz refletido na íris, cada micro-textura da pele e cada sombra de oclusão.

Na engenharia de software e no treinamento de redes neurais, o princípio é idêntico: a excelência não surge de um golpe de sorte, mas da soma milimétrica de refinamentos consistentes.
`
  }
];

export const DEFAULT_CV_CONFIG = {
  // Versao em Ingles (EN - International Resume)
  googleDocsUrlEn: "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing",
  pdfUrlEn: "/Matheus Vinicius Silva Freire de Castro.pdf",
  // Versao em Portugues (PT - Curriculo Nacional)
  googleDocsUrlPt: "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing",
  pdfUrlPt: "/Matheus Vinicius Silva Freire de Castro.pdf",
  // Fallbacks de compatibilidade retroativa
  googleDocsUrl: "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing",
  pdfUrl: "/Matheus Vinicius Silva Freire de Castro.pdf",
  updatedAt: "2026-03-15"
};

export const DEFAULT_EXPERIENCES = [
  {
    id: "exp-detran",
    title: "IT Intern",
    titleEn: "IT Intern",
    titlePt: "Estagiário de TI",
    company: "Detran",
    time: "June 2026 - Present",
    timeEn: "June 2026 - Present",
    timePt: "Junho 2026 - Atualmente",
    displayOrder: 0,
    bullets: [
      "Design, develop, and implement software systems to meet agency requirements;",
      "Applying modern programming techniques and agile project management practices;",
      "Conduct system requirements analysis and specifications;",
      "Develop mobile application initiatives."
    ],
    bulletsEn: [
      "Design, develop, and implement software systems to meet agency requirements;",
      "Applying modern programming techniques and agile project management practices;",
      "Conduct system requirements analysis and specifications;",
      "Develop mobile application initiatives."
    ],
    bulletsPt: [
      "Projetar, desenvolver e implementar softwares para atender as necessidades do Órgão;",
      "Utilizando técnicas de programação e gestão de projetos;",
      "Desenvolver análise de requisitos;",
      "Desenvolver projetos para aplicativo mobile."
    ]
  },
  {
    id: "exp-cachina",
    title: "IT Intern",
    titleEn: "IT Intern",
    titlePt: "Estagiário de TI",
    company: "Cachina Soluções",
    time: "March 2026 - July 2026",
    timeEn: "March 2026 - July 2026",
    timePt: "Março 2026 - Julho 2026",
    displayOrder: 1,
    bullets: [
      "Backend architecture development and optimization;",
      "Intelligent workflow automation using n8n integrated into digital ecosystems;",
      "Agile Linux server management (Ubuntu Server) and technical documentation of operational procedures;",
      "Core technologies: Python, SQL, n8n, Linux, Bash, and Git."
    ],
    bulletsEn: [
      "Backend architecture development and optimization;",
      "Intelligent workflow automation using n8n integrated into digital ecosystems;",
      "Agile Linux server management (Ubuntu Server) and technical documentation of operational procedures;",
      "Core technologies: Python, SQL, n8n, Linux, Bash, and Git."
    ],
    bulletsPt: [
      "Desenvolvimento e otimização de arquiteturas de backend;",
      "Automação de fluxos de trabalho inteligentes utilizando n8n integrados a ecossistemas digitais;",
      "Gerenciamento ágil de servidores Linux (Ubuntu Server) e documentação técnica de processos operacionais;",
      "Principais tecnologias utilizadas: Python, SQL, n8n, Linux, Bash e Git."
    ]
  },
  {
    id: "exp-ufrn",
    title: "Bachelor of Science in Information Technology (BTI)",
    titleEn: "Bachelor of Science in Information Technology (BTI)",
    titlePt: "Bacharelado em Tecnologia da Informação (BTI)",
    company: "UFRN - Campus Natal",
    time: "2024.1 - Present",
    timeEn: "2024.1 - Present",
    timePt: "2024.1 - Presente",
    displayOrder: 2,
    bullets: [
      "Currently in 6th semester;",
      "Strong academic foundation in algorithms, advanced data structures, applied statistics, and linear algebra;",
      "Active focus in MLOps, Deep Learning, Reinforcement Learning, and High Performance Computing."
    ],
    bulletsEn: [
      "Currently in 6th semester;",
      "Strong academic foundation in algorithms, advanced data structures, applied statistics, and linear algebra;",
      "Active focus in MLOps, Deep Learning, Reinforcement Learning, and High Performance Computing."
    ],
    bulletsPt: [
      "Cursando o 6º período;",
      "Sólida base acadêmica em algoritmos, estruturas de dados avançadas, estatística e álgebra linear aplicadas;",
      "Foco em andamento nas áreas de MLOps, Deep Learning, Aprendizado por Reforço e Computação de Alto Desempenho."
    ]
  },
  {
    id: "exp-ifrn",
    title: "IT Technician Training",
    titleEn: "IT Technician Training",
    titlePt: "Formação Técnica em TI",
    company: "IFRN Campus Lajes",
    time: "2019 - 2022",
    timeEn: "2019 - 2022",
    timePt: "2019 - 2022",
    displayOrder: 3,
    bullets: [
      "Integrated vocational education focused on Web Development;",
      "Solid algorithmic problem-solving and relational database fundamentals;",
      "Hands-on lab experience with assembly, maintenance, and deployment of local operational architectures."
    ],
    bulletsEn: [
      "Integrated vocational education focused on Web Development;",
      "Solid algorithmic problem-solving and relational database fundamentals;",
      "Hands-on lab experience with assembly, maintenance, and deployment of local operational architectures."
    ],
    bulletsPt: [
      "Formação técnica integrada estruturada com foco em Desenvolvimento web;",
      "Desenvolvimento de lógica algorítmica sólida e fundamentos de bancos de dados relacionais;",
      "Práticas de laboratório envolvendo montagem, manutenção e implantação de arquiteturas operacionais locais."
    ]
  }
];

export const DEFAULT_DRAWINGS = [
  { id: "draw-1", title: "Aquaman", src: arte1, displayOrder: 0, description: "Realistic graphite artwork", descriptionEn: "Realistic graphite artwork", descriptionPt: "Arte realista em grafite" },
  { id: "draw-2", title: "HP", src: arte2, displayOrder: 1, description: "Realistic graphite artwork", descriptionEn: "Realistic graphite artwork", descriptionPt: "Arte realista em grafite" },
  { id: "draw-3", title: "Wanda Maximoff", src: arte3, displayOrder: 2, description: "Realistic graphite artwork", descriptionEn: "Realistic graphite artwork", descriptionPt: "Arte realista em grafite" },
  { id: "draw-4", title: "The Joker (Joaquin Phoenix)", src: arte4, displayOrder: 3, description: "Realistic graphite artwork", descriptionEn: "Realistic graphite artwork", descriptionPt: "Arte realista em grafite" },
  { id: "draw-5", title: "Game of Thrones", src: arte5, displayOrder: 4, description: "Realistic graphite artwork", descriptionEn: "Realistic graphite artwork", descriptionPt: "Arte realista em grafite" },
  { id: "draw-6", title: "Jack Sparrow on A4 canvas", src: arte6, displayOrder: 5, description: "Graphite on A4 canvas", descriptionEn: "Graphite on A4 canvas", descriptionPt: "Grafite sobre tela A4" },
  { id: "draw-7", title: "Black Widow", src: arte7, displayOrder: 6, description: "Realistic graphite artwork", descriptionEn: "Realistic graphite artwork", descriptionPt: "Arte realista em grafite" },
  { id: "draw-8", title: "Game of Thrones", src: arte8, displayOrder: 7, description: "Realistic graphite artwork", descriptionEn: "Realistic graphite artwork", descriptionPt: "Arte realista em grafite" },
  { id: "draw-9", title: "Geralt of Rivia (The Witcher 3)", src: arte9, displayOrder: 8, description: "Graphite on A2 canvas", descriptionEn: "Graphite on A2 canvas", descriptionPt: "Grafite em Tela A2" }
];

const STORAGE_KEYS = {
  PROJECTS: "portfolio_projects_data_v1",
  ARTICLES: "portfolio_articles_data_v1",
  THOUGHTS: "portfolio_thoughts_data_v1",
  EXPERIENCES: "portfolio_experiences_data_v1",
  CV_CONFIG: "portfolio_cv_config_v1",
  DRAWINGS: "portfolio_drawings_data_v1",
  CUSTOM_HOBBY: "portfolio_custom_hobby_v1"
};

// Helper methods with localStorage fallback
export function getStoredProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => {
          const defaultItem = DEFAULT_PROJECTS.find((p) => p.id === item.id);
          if (!defaultItem) return item;
          return {
            ...defaultItem,
            ...item,
            contentEn: item.contentEn || defaultItem.contentEn,
            contentPt: item.contentPt || defaultItem.contentPt,
            titleEn: item.titleEn || defaultItem.titleEn,
            titlePt: item.titlePt || defaultItem.titlePt,
            shortDescriptionEn: item.shortDescriptionEn || defaultItem.shortDescriptionEn,
            shortDescriptionPt: item.shortDescriptionPt || defaultItem.shortDescriptionPt,
            aboutContextEn: item.aboutContextEn || defaultItem.aboutContextEn,
            aboutContextPt: item.aboutContextPt || defaultItem.aboutContextPt
          };
        });
      }
    }
  } catch (e) {
    console.error("Erro ao ler projetos do localStorage:", e);
  }
  return DEFAULT_PROJECTS;
}

export function saveProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error("Erro ao salvar projetos:", e);
  }
}

export function resetProjectsToDefault() {
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  return DEFAULT_PROJECTS;
}

export function getStoredArticles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ARTICLES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Erro ao ler artigos:", e);
  }
  return DEFAULT_ARTICLES;
}

export function saveArticles(articles) {
  try {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  } catch (e) {
    console.error("Erro ao salvar artigos:", e);
  }
}

export function getStoredThoughts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THOUGHTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Erro ao ler pensamentos:", e);
  }
  return DEFAULT_THOUGHTS;
}

export function saveThoughts(thoughts) {
  try {
    localStorage.setItem(STORAGE_KEYS.THOUGHTS, JSON.stringify(thoughts));
  } catch (e) {
    console.error("Erro ao salvar pensamentos:", e);
  }
}

export function getStoredExperiences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPERIENCES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => {
          const defaultItem = DEFAULT_EXPERIENCES.find((e) => e.id === item.id);
          if (!defaultItem) return item;
          return {
            ...defaultItem,
            ...item,
            titleEn: item.titleEn || defaultItem.titleEn,
            titlePt: item.titlePt || defaultItem.titlePt,
            timeEn: item.timeEn || defaultItem.timeEn,
            timePt: item.timePt || defaultItem.timePt,
            bulletsEn: (item.bulletsEn && item.bulletsEn.length > 0) ? item.bulletsEn : defaultItem.bulletsEn,
            bulletsPt: (item.bulletsPt && item.bulletsPt.length > 0) ? item.bulletsPt : defaultItem.bulletsPt
          };
        });
      }
    }
  } catch (e) {
    console.error("Erro ao ler experiências do localStorage:", e);
  }
  return DEFAULT_EXPERIENCES;
}

export function saveExperiences(experiences) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(experiences));
  } catch (e) {
    console.error("Erro ao salvar experiências:", e);
  }
}

export function getStoredDrawings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAWINGS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Erro ao ler desenhos do localStorage:", e);
  }
  return DEFAULT_DRAWINGS;
}

export function saveDrawings(drawings) {
  try {
    localStorage.setItem(STORAGE_KEYS.DRAWINGS, JSON.stringify(drawings));
  } catch (e) {
    console.error("Erro ao salvar desenhos:", e);
  }
}

export function getStoredCvConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CV_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ...DEFAULT_CV_CONFIG,
          ...parsed,
          googleDocsUrlEn: parsed.googleDocsUrlEn || parsed.googleDocsUrl || DEFAULT_CV_CONFIG.googleDocsUrlEn,
          googleDocsUrlPt: parsed.googleDocsUrlPt || parsed.googleDocsUrl || DEFAULT_CV_CONFIG.googleDocsUrlPt,
          pdfUrlEn: parsed.pdfUrlEn || parsed.pdfUrl || DEFAULT_CV_CONFIG.pdfUrlEn,
          pdfUrlPt: parsed.pdfUrlPt || parsed.pdfUrl || DEFAULT_CV_CONFIG.pdfUrlPt
        };
      }
    }
  } catch (e) {
    console.error("Erro ao ler configuração do CV:", e);
  }
  return DEFAULT_CV_CONFIG;
}

export function saveCvConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEYS.CV_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error("Erro ao salvar configuração do CV:", e);
  }
}

// Convert normal Google Docs links to embedable format
export function convertGoogleDocsToEmbedUrl(url) {
  if (!url || typeof url !== "string") return "";
  let cleanUrl = url.trim();
  
  // If it's already an embed/preview link
  if (cleanUrl.includes("/pub?embedded=true") || cleanUrl.includes("/preview")) {
    return cleanUrl;
  }
  
  // Example: https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing
  const match = cleanUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const docId = match[1];
    return `https://docs.google.com/document/d/${docId}/preview`;
  }
  
  return cleanUrl;
}

export const DEFAULT_HOBBIES_LIST = [
  {
    id: "hobby-1",
    category: "Art",
    layout: "tall",
    titlePt: "Arte & Desenho Hiper-realista",
    titleEn: "Art & Hyper-realism",
    descriptionPt: "O desenho e a arte hiper-realista me ensinaram disciplina, atenção extrema aos detalhes e paciência para construir resultados complexos camada por camada.",
    descriptionEn: "Drawing and hyper-realistic art taught me discipline, extreme attention to detail, and the patience to build complex results layer by layer.",
    photoUrl: capa1,
    isPublished: true
  },
  {
    id: "hobby-2",
    category: "Gaming",
    layout: "wide",
    titlePt: "Mundo Gamer & Retrô",
    titleEn: "Gaming & Retro",
    descriptionPt: "Dos clássicos retrô aos jogos de estratégia modernos, vejo o game design como uma aula de sistemas complexos, feedback imediato e resolução criativa de problemas.",
    descriptionEn: "From retro classics to modern strategy games, I see game design as a masterclass in complex systems, immediate feedback loops, and creative problem solving.",
    photoUrl: capa2,
    isPublished: true
  },
  {
    id: "hobby-3",
    category: "Future",
    layout: "",
    titlePt: "Fronteiras da IA & ML",
    titleEn: "AI Frontiers & ML",
    descriptionPt: "Fascinado pelo impacto da inteligência artificial generativa, modelos cognitivos e automação na evolução do trabalho humano e da sociedade.",
    descriptionEn: "Fascinated by the impact of generative artificial intelligence, cognitive models, and automation on the evolution of human labor and society.",
    photoUrl: capa3,
    isPublished: true
  },
  {
    id: "hobby-4",
    category: "Reading",
    layout: "",
    titlePt: "Leituras & Filosofia",
    titleEn: "Reading & Philosophy",
    descriptionPt: "Livros de ficção científica, filosofia e tecnologia expandem minha visão de mundo e alimentam novas abordagens para engenharia de software.",
    descriptionEn: "Sci-fi, philosophy, and technology books broaden my worldview and fuel fresh perspectives on software engineering.",
    photoUrl: capa4,
    isPublished: true
  },
  {
    id: "hobby-5",
    category: "Lifestyle",
    layout: "",
    titlePt: "Vida Ativa & Disciplina",
    titleEn: "Active Life & Fitness",
    descriptionPt: "Musculação e rotina saudável são pilares fundamentais para manter foco absoluto, alta energia e clareza mental durante maratonas de código.",
    descriptionEn: "Weightlifting and a healthy routine are fundamental pillars for maintaining absolute focus, high energy, and mental clarity during coding sprints.",
    photoUrl: capa5,
    isPublished: true
  },
  {
    id: "hobby-6",
    category: "Coffee",
    layout: "",
    titlePt: "Código & Café Especial",
    titleEn: "Code & Special Coffee",
    descriptionPt: "O café é meu parceiro diário para transformar problemas complexos de lógica em soluções elegantes e arquiteturas de código limpo.",
    descriptionEn: "Coffee is my daily partner in turning complex logic puzzles into elegant solutions and clean code architectures.",
    photoUrl: capa6,
    isPublished: true
  },
  {
    id: "hobby-7",
    category: "Deep Learning & Arte",
    layout: "custom-hobby-card",
    titlePt: "Hiper-realismo & Algoritmos",
    titleEn: "Hyper-realism & Algorithms",
    descriptionPt: "A mesma precisão cirúrgica exigida no hiper-realismo a grafite guia o refinamento de tensores e redes neurais profundas.",
    descriptionEn: "The same surgical precision demanded in graphite hyper-realism guides deep neural network refinement.",
    photoUrl: capa1,
    isPublished: true
  }
];

export function getStoredHobbies() {
  try {
    const raw = localStorage.getItem("portfolio_hobbies_list");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return DEFAULT_HOBBIES_LIST.map((defHobby) => {
          const match = parsed.find((p) => p.id === defHobby.id);
          return match ? { ...defHobby, ...match } : defHobby;
        });
      }
    }
  } catch (e) {
    console.warn("Falha ao ler hobbies:", e);
  }
  return DEFAULT_HOBBIES_LIST;
}

export function saveHobbies(hobbies) {
  try {
    localStorage.setItem("portfolio_hobbies_list", JSON.stringify(hobbies));
  } catch (e) {
    console.error("Erro ao salvar hobbies:", e);
  }
}

export const DEFAULT_CUSTOM_HOBBY = {
  category: "Deep Learning & Arte",
  titlePt: "Hiper-realismo & Algoritmos",
  titleEn: "Hyper-realism & Algorithms",
  descriptionPt: "A mesma precisão cirúrgica exigida no hiper-realismo a grafite guia o refinamento de tensores e redes neurais profundas.",
  descriptionEn: "The same surgical precision demanded in graphite hyper-realism guides deep neural network refinement.",
  photoUrl: "",
  isPublished: true
};

export function getStoredCustomHobby() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_HOBBY);
    if (raw) {
      return { ...DEFAULT_CUSTOM_HOBBY, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn("Falha ao ler custom hobby:", e);
  }
  return DEFAULT_CUSTOM_HOBBY;
}

export function saveCustomHobby(data) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_HOBBY, JSON.stringify(data));
  } catch (e) {
    console.error("Erro ao salvar custom hobby:", e);
  }
}
