// src/data/projectsData.js
// Centralized project and publication data with local storage support

export const DEFAULT_PROJECTS = [
  {
    id: "agentmetrics",
    title: "AgentMetrics",
    category: "Profissional",
    tags: ["FastAPI", "Data & ML", "Python", "Docker"],
    shortDescription: "API de telemetria inteligente desenvolvida para monitorar o consumo de recursos e metrificar o desempenho de agentes de IA em tempo real.",
    aboutContext: "Sistema de monitoramento e telemetria para LLMs e agentes autônomos. Coleta métricas de latência, consumo de tokens, custo por requisição e vazão de inferência em clusters de IA.",
    github: "https://github.com/Matheus-dCastro/AgentMetrics",
    demo: "",
    contentType: "markdown", // 'markdown' | 'google-docs' | 'pdf'
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2026-03-15",
    content: `# AgentMetrics: Telemetria de Agentes Autônomos de IA

Uma solução robusta de telemetria e observabilidade desenvolvida para monitorar agentes baseados em LLMs em ambientes de produção.

## 🎯 Problema & Visão Geral
À medida que agentes de inteligência artificial são integrados a rotinas corporativas, torna-se crítico rastrear o consumo de tokens, os tempos de inferência e a assertividade das respostas. O AgentMetrics resolve isso com uma arquitetura assíncrona orientada a eventos.

## 🛠️ Arquitetura e Tecnologias
- **FastAPI (Python 3.11):** Backend de alta performance com endpoints assíncronos (\`async/await\`).
- **PostgreSQL & TimescaleDB:** Armazenamento otimizado para séries temporais de métricas.
- **Docker & Docker Compose:** Conteinerização de todos os serviços para reprodutibilidade.
- **Pydantic v2:** Validação estrita de contratos de dados em tempo de execução.

## 📊 Métricas Monitoradas
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

## 🚀 Como Executar Localmente
\`\`\`bash
# Clone o repositório
git clone https://github.com/Matheus-dCastro/AgentMetrics.git
cd AgentMetrics

# Suba a stack com Docker
docker-compose up --build
\`\`\`
`
  },
  {
    id: "medical-segmentation",
    title: "Medical Image Segmentation",
    category: "Acadêmico",
    tags: ["Deep Learning", "Python", "PyTorch", "U-Net"],
    shortDescription: "Pipeline de Deep Learning supervisionado para segmentação pixel a pixel de estruturas e lesões em imagens médicas utilizando arquitetura U-Net.",
    aboutContext: "Pesquisa acadêmica e aplicação prática de redes convolucionais e arquitetura U-Net para segmentação semântica de exames de tomografia e ressonância magnética.",
    github: "https://github.com/Matheus-dCastro/Projeto-de-AM-Supervisionado",
    demo: "",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2026-02-10",
    content: `# Medical Image Segmentation com Arquitetura U-Net

Projeto de Aprendizado de Máquina Supervisionado focado na segmentação precisa de patologias em imagens de diagnóstico por imagem.

## 🔬 Metodologia e Fundamentação
A segmentação semântica no domínio médico requer alta sensibilidade e especificidade. Utilizamos uma rede neural convolucional com conexões de salto (*skip connections*) baseada na consagrada arquitetura U-Net.

### Pipeline de Dados
- **Pré-processamento:** Normalização de histograma, corte de ROI (*Region of Interest*) e ampliação de dados (*Data Augmentation*) geométrica e elástica.
- **Funções de Perda:** Combinação ponderada de *Dice Loss* com *Binary Cross-Entropy* para contornar o severo desbalanceamento de classes pixel a pixel.

## 📈 Resultados Obtidos
| Métrica | Valor Médio | Desvio Padrão |
| :--- | :--- | :--- |
| **Dice Score (F1)** | **0.894** | ± 0.021 |
| **IoU (Jaccard)** | **0.812** | ± 0.028 |
| **Precisão** | **0.915** | ± 0.015 |
| **Recall / Sensibilidade** | **0.882** | ± 0.024 |

> "A combinação de Dice Loss com penalização de borda reduziu artefatos em contornos anatômicos complexos em mais de 18%."

## 💻 Tecnologias
- Python 3.10
- PyTorch & Torchvision
- Albumentations para Data Augmentation
- OpenCV & Matplotlib
`
  },
  {
    id: "obsidian-neon-theme",
    title: "Obsidian Neon Theme",
    category: "Pessoal",
    tags: ["VS Code Theme", "UI & Design", "JSON", "Design System"],
    shortDescription: "Tema e suíte visual para VS Code com paletas neon de alto contraste, ícones customizados e realce de sintaxe semântico refinado.",
    aboutContext: "Extensão publicada no Visual Studio Code Marketplace projetada com ergonomia visual para programadores que passam longas horas codificando em ambientes de baixa luminosidade.",
    github: "https://github.com/Matheus-dCastro/obsidian-neon-thema",
    demo: "https://marketplace.visualstudio.com/items?itemName=Alomyr.obsidian-neon-110",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2026-01-20",
    content: `# Obsidian Neon Theme para Visual Studio Code

Tema com estética cyberpunk refinada, focado em alta legibilidade sem fadiga visual para sessões noturnas de código.

## 🎨 Filosofia de Design
Inspirado na precisão do traço do hiper-realismo e no contraste dinâmico de interfaces neons, o Obsidian Neon equilibra tons escuros profundos (#030306 e #08080c) com acentos violetas luminosos e ciano elétrico.

- **Tokens Semânticos Claros:** Diferenciação visual imediata entre tipos primitivos, palavras-chave de controle de fluxo e chamadas de métodos.
- **Contraste WCAG AAA:** Mais de 7:1 de proporção de contraste em todo o código fonte.
- **Suporte Multilinguagem:** Otimizado para Python, C++, Rust, TypeScript, Java e Markdown.

## 📥 Instalação
No VS Code, abra a paleta de comandos (\`Ctrl+P\` ou \`Cmd+P\`) e execute:
\`\`\`bash
ext install Alomyr.obsidian-neon-110
\`\`\`
`
  },
  {
    id: "cachina-solucoes",
    title: "Cachina Soluções",
    category: "Profissional",
    tags: ["Automation & Web", "n8n", "Linux", "Bash"],
    shortDescription: "Desenvolvimento e hospedagem do ecossistema de interfaces e apresentação estratégica corporativa.",
    aboutContext: "Plataforma corporativa e automação de processos inteligentes implementada para a empresa Cachina Soluções.",
    github: "https://github.com/Matheus-dCastro/Site-Cachina-2026",
    demo: "https://cachina.com.br/",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2026-02-28",
    content: `# Cachina Soluções: Ecossistema Digital & Automação

Projeto corporativo abrangendo a arquitetura de apresentação institucional, automação de processos e gestão de infraestrutura em nuvem.

## 💼 Escopo do Trabalho
- Implementação de fluxos de integração contínua e automação com **n8n**.
- Configuração e sustentação de servidores dedicados Linux (Ubuntu Server).
- Criação da interface web institucional com carregamento ultra rápido e SEO otimizado.
- Integração de formulários de captação e disparos via webhooks corporativos.
`
  },
  {
    id: "task-system-cli",
    title: "Task System CLI",
    category: "Pessoal",
    tags: ["Python & SQL", "PostgreSQL", "MVC", "CLI"],
    shortDescription: "Arquitetura MVC completa com persistência em PostgreSQL para controle eficiente de fluxos de trabalho via terminal.",
    aboutContext: "Aplicativo CLI desenvolvido em Python seguindo rigorosamente os padrões de projeto MVC com persistência relacional.",
    github: "https://github.com/Matheus-dCastro/Sistema-de-Controle-em-Py3",
    demo: "",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2025-11-12",
    content: `# Task System CLI: Gestão Produtiva no Terminal

Ferramenta CLI para gerenciamento ágil de tarefas e auditoria de atividades com banco de dados PostgreSQL.

## 🏛️ Padrão Arquitetural
Adotou-se o modelo MVC (Model-View-Controller):
- **Model:** Entidades de domínio mapeadas com validação e conexões seguras ao banco de dados relacional.
- **View:** Interface de linha de comando com menus interativos e saída tabulada colorida.
- **Controller:** Orquestrador das regras de negócio, bloqueios de concorrência e transações atômicas ACID.
`
  },
  {
    id: "timemaster",
    title: "TimeMaster",
    category: "Acadêmico",
    tags: ["Java", "OOP", "LP2", "Design Patterns"],
    shortDescription: "Sistema modular backend para gerenciamento de compromissos e agendamentos complexos desenvolvido em LP2.",
    aboutContext: "Projeto acadêmico de Linguagem de Programação 2 explorando programação orientada a objetos pura, padrões de projeto e tratamento robusto de exceções.",
    github: "https://github.com/Matheus-dCastro/Sistema-de-Agenda-de-Compromissos.git",
    demo: "",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2025-06-20",
    content: `# TimeMaster: Gestão de Agendamentos em Java

Arquitetura modular em Java com classes imutáveis para cálculo de intervalos de tempo e resolução automática de conflitos em calendários.
`
  },
  {
    id: "zombie-dice",
    title: "Zombie Dice",
    category: "Acadêmico",
    tags: ["C++", "OOP", "State Machine", "CLI Game"],
    shortDescription: "Implementação orientada a objetos e máquina de estados para execução de jogo de dados lógico via terminal CLI.",
    aboutContext: "Jogo de estratégia probabilística implementado em C++ com gerenciamento manual de memória e máquina de estados finitos.",
    github: "https://github.com/Matheus-dCastro/trabalho-06-projeto-zombie-dice-Turma-DIM0176---PROGRAMA-O-I---T02-2025.1-.git",
    demo: "",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2025-05-15",
    content: `# Zombie Dice em C++ Moderno

Implementação completa das regras do jogo com simulação estatística de probabilidades de rolagem e inteligência para decisão de parada (Push Your Luck).
`
  },
  {
    id: "projeto-snaze",
    title: "Projeto snaze",
    category: "Acadêmico",
    tags: ["Game in CPP", "C++", "Algorithms", "Pathfinding"],
    shortDescription: "Simulação computacional onde o programa guia uma serpente inteligente através de um labirinto até o alimento com algoritmos de busca.",
    aboutContext: "Trabalho acadêmico de Programação I envolvendo representação de grafos, matrizes espparsas e busca em largura (BFS).",
    github: "https://github.com/Matheus-dCastro/trabalho-07-projeto-snaze--Turma-DIM0176---PROGRAMA-O-I---T02-2025.1-.git",
    demo: "",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2025-04-30",
    content: `# Projeto Snaze: IA de Busca em Labirinto

Algoritmo de navegação autônoma em labirintos dinâmicos utilizando estruturas de fila e matrizes de adjacência.
`
  },
  {
    id: "password-generator",
    title: "password generator",
    category: "Pessoal",
    tags: ["CPP", "Security", "Entropy", "CLI"],
    shortDescription: "Gerador determinístico e estocástico de senhas de alta entropia com validação de complexidade e tamanho configurável.",
    aboutContext: "Ferramenta de segurança em C++ focada em geração segura de chaves criptográficas e senhas resistentes a ataques de dicionário.",
    github: "https://github.com/Matheus-dCastro/trabalho-03-projeto-passgen-Turma-DIM0176---PROGRAMA-O-I---T02-2025.1-",
    demo: "",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2025-03-10",
    content: `# Password Generator em C++

Utilitário criptográfico para geração de senhas e passphrases com cálculo em tempo real de bits de entropia de Shannon.
`
  }
];

export const DEFAULT_ARTICLES = [
  {
    id: "art-1",
    title: "Otimização de Inferência em Modelos de Linguagem na Borda",
    category: "Acadêmico",
    tags: ["LLM", "Quantização", "Edge Computing", "IA"],
    shortDescription: "Análise comparativa entre quantizações 4-bit (AWQ vs GGUF) executadas em hardware de consumo.",
    aboutContext: "Estudo sobre viabilidade e redução de latência no deploy de modelos de ponta em servidores locais.",
    contentType: "google-docs",
    googleDocsUrl: "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing",
    pdfUrl: "",
    updatedAt: "2026-03-01",
    content: `# Otimização de Inferência em Modelos de Linguagem na Borda

Este artigo encontra-se sincronizado com o documento no Google Docs. Caso deseje editar o conteúdo original, basta alterar no Google Docs.

> O documento pode ser lido abaixo pelo leitor integrado ou acessado externamente.
`
  },
  {
    id: "art-2",
    title: "Segmentação U-Net Aplicada a Tomografias Pulmonares",
    category: "Acadêmico",
    tags: ["Deep Learning", "Visão Computacional", "Artigo"],
    shortDescription: "Relatório de experimentos com funções de perda combinadas (Dice + Focal Loss).",
    aboutContext: "Artigo científico detalhando o processo experimental de treinamento supervisionado em imagens biomédicas.",
    contentType: "pdf",
    googleDocsUrl: "",
    pdfUrl: "/Matheus Vinicius Silva Freire de Castro.pdf",
    updatedAt: "2026-02-15",
    content: `# Segmentação U-Net Aplicada a Tomografias Pulmonares

Artigo publicado com diagramas de arquitetura, curvas de convergência e métricas detalhadas.
`
  }
];

export const DEFAULT_THOUGHTS = [
  {
    id: "th-1",
    title: "A Intersecção entre Hiper-realismo no Desenho e Engenharia de Software",
    category: "Pessoal",
    tags: ["Reflexão", "Design", "Arte", "Código"],
    shortDescription: "Como a paciência e a observação micrométrica do desenho a grafite moldam a precisão na escrita de código limpo.",
    aboutContext: "Ensaio pessoal sobre foco, paciência e atenção aos mínimos detalhes.",
    contentType: "markdown",
    googleDocsUrl: "",
    pdfUrl: "",
    updatedAt: "2026-01-05",
    content: `# A Intersecção entre Hiper-realismo no Desenho e Engenharia de Software

No hiper-realismo, você não desenha um olho; você desenha cada gradiente de luz refletido na íris, cada micro-textura da pele e cada sombra de oclusão.

Na engenharia de software e no treinamento de redes neurais, o princípio é idêntico: a excelência não surge de um golpe de sorte, mas da soma milimétrica de refinamentos consistentes.
`
  }
];

const STORAGE_KEYS = {
  PROJECTS: "portfolio_projects_data_v1",
  ARTICLES: "portfolio_articles_data_v1",
  THOUGHTS: "portfolio_thoughts_data_v1"
};

// Helper methods with localStorage fallback
export function getStoredProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
