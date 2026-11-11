// src/data/blogData.js
// Centralized Data Layer for the Dual-Blog Ecosystem (/blog and /blog/alomyr)

export const BLOG_CHANNELS = {
  TECH: "tech",
  ALOMYR: "alomyr"
};

export const DEFAULT_BLOG_POSTS = [
  // ==========================================
  // CANAL 1: ACADÊMICO & PROFISSIONAL (/blog)
  // ==========================================
  {
    id: "post-agentmetrics-architecture",
    channel: "tech",
    titlePt: "Arquitetura do AgentMetrics: Telemetria de LLMs e Agentes em Produção",
    titleEn: "AgentMetrics Architecture: Real-time Telemetry for LLMs and Autonomous Agents",
    summaryPt: "Como construímos uma API assíncrona orientada a eventos em FastAPI e TimescaleDB para metrificar latência TTFT, consumo de tokens e taxa de conformidade em clusters de IA.",
    summaryEn: "How we engineered an asynchronous event-driven telemetry API using FastAPI and TimescaleDB to track TTFT latency, token cost, and compliance in AI clusters.",
    category: "Machine Learning & Backend",
    tags: ["#FastAPI", "#AI-Agents", "#Telemetry", "#TimescaleDB", "#Docker", "#Python"],
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Exemplo de embed
    galleryImages: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80"
    ],
    contentPt: `## O Desafio da Observabilidade em Agentes Autônomos

À medida que sistemas baseados em Modelos de Linguagem de Grande Escala (LLMs) assumem tomadas de decisão críticas em ambientes corporativos, a tradicional observabilidade de microsserviços (CPU, memória e HTTP status) prova-se insuficiente.

No **AgentMetrics**, desenvolvemos uma camada especializada de telemetria capaz de monitorar métricas intrínsecas à inferência neural:
- **Time to First Token (TTFT):** Medição precisa da latência de percepção inicial.
- **Vazão de Tokens por Segundo (TPS):** Avaliação de throughput por endpoint e por provedor (Groq, vLLM, OpenAI).
- **Taxa de Alucinação e Heurísticas de Conformidade:** Benchmarking comparativo utilizando juízes sintéticos.

### Arquitetura de Ingestão de Alto Desempenho
A camada de ingestão utiliza endpoints nativos assíncronos em **Python 3.11 com FastAPI**, validando payloads em tempo de execução via **Pydantic v2**. As métricas de séries temporais são agregadas em hiper-tabelas no **PostgreSQL + TimescaleDB**, permitindo consultas analíticas com latência submilisegundo.`,
    contentEn: `## The Observability Challenge in Autonomous AI

As LLM-driven autonomous systems take over business processes, standard service metrics (CPU, RAM, HTTP status) are no longer enough.

With **AgentMetrics**, we designed a dedicated observability layer tracking neural inference metrics:
- **Time to First Token (TTFT):** Measuring initial response latency.
- **Token Throughput (TPS):** Granular benchmarks per model and inference provider.
- **Hallucination & Conformance Rate:** Heuristic evaluation paired with synthetic LLM judges.

### High-Throughput Ingestion Pipeline
The telemetry collector uses native \`async/await\` in **Python 3.11 with FastAPI**, enforcing strict contracts via **Pydantic v2**. Time-series data is stored in partitioned hyper-tables inside **PostgreSQL + TimescaleDB**.`,
    relatedProjectId: "agentmetrics",
    author: "Matheus de Castro",
    publishedAt: "2026-11-02",
    readTime: "6 min",
    isPublished: true
  },
  {
    id: "post-medical-unet-segmentation",
    channel: "tech",
    titlePt: "Segmentação Semântica em Imagens Médicas com PyTorch e U-Net",
    titleEn: "Semantic Segmentation in Medical Imaging with PyTorch and U-Net",
    summaryPt: "Explorando a arquitetura U-Net com conexões de salto (skip connections) para isolamento preciso de estruturas celulares e regiões de interesse biomédico.",
    summaryEn: "Deep dive into the U-Net architecture with skip connections for fine-grained cellular and biomedical structure segmentation.",
    category: "Computer Vision & Deep Learning",
    tags: ["#PyTorch", "#DeepLearning", "#UNet", "#ComputerVision", "#Biomedical"],
    coverImage: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80",
    youtubeUrl: "",
    galleryImages: [
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80"
    ],
    contentPt: `## Precisão Cirúrgica em Redes Convolucionais

A segmentação semântica em imagens médicas exige um delicado equilíbrio entre abstração semântica profunda e reconstrução espacial de alta fidelidade.

Utilizamos a consagrada arquitetura **U-Net**, onde o caminho de contração (*encoder*) extrai mapas de características de alto nível, enquanto o caminho de expansão (*decoder*) reconstitui as dimensões espaciais originais.

### O Papel Decisivo das Conexões de Salto (Skip Connections)
O grande diferencial da U-Net reside nas *skip connections*, que transferem mapas de características de alta resolução do encoder diretamente para os estágios correspondentes do decoder. Isso preserva informações de borda e detalhes morfológicos finos que seriam irremediavelmente perdidos em operações de pooling sucessivas.`,
    contentEn: `## Surgical Precision in Convolutional Networks

Biomedical image segmentation demands a balance between high-level semantic reasoning and fine-grained spatial localization.

Using **PyTorch**, we implemented the **U-Net** topology, where an encoder path captures contextual features while a symmetric decoder path enables precise localization.`,
    relatedProjectId: "segmentacao-medica",
    author: "Matheus de Castro",
    publishedAt: "2026-10-25",
    readTime: "7 min",
    isPublished: true
  },
  {
    id: "post-n8n-devops-automation",
    channel: "tech",
    titlePt: "Automação de Workflows Críticos e Governança com n8n em Linux Ubuntu",
    titleEn: "Critical Workflow Automation & Infrastructure Governance with n8n on Linux",
    summaryPt: "Estratégias de deploy serverless, webhooks criptografados e pipelines de orquestração integrando GitHub Actions, alertas operacionais e microsserviços.",
    summaryEn: "Deployment strategies, encrypted webhooks, and orchestration pipelines connecting GitHub Actions, infrastructure alerts, and microservices.",
    category: "DevOps & Automações",
    tags: ["#Linux", "#n8n", "#DevOps", "#Automation", "#Bash", "#Ubuntu"],
    coverImage: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=80",
    youtubeUrl: "",
    galleryImages: [],
    contentPt: `## Orquestrando Fluxos Resilientes

Automatizar processos não significa apenas disparar scripts: envolve idempotência, tratamento de falhas transientes e rastreabilidade total das execuções.

No ambiente de produção sobre **Linux Ubuntu Server**, configuramos instâncias dedicadas do **n8n** operando em contêineres Docker isolados com reverse proxy Nginx e certificados SSL automáticos via Let's Encrypt.`,
    contentEn: `## Engineering Resilient Orchestration

Automating enterprise workflows requires idempotency, graceful retry strategies, and end-to-end execution audit logs. On **Ubuntu Linux Server**, we orchestrate n8n containers paired with Nginx reverse proxies and encrypted webhook endpoints.`,
    relatedProjectId: "automacoes-n8n",
    author: "Matheus de Castro",
    publishedAt: "2026-10-14",
    readTime: "5 min",
    isPublished: true
  },

  // ==========================================
  // CANAL 2: LABORATÓRIO GEEK & CRIATIVO (/blog/alomyr)
  // ==========================================
  {
    id: "post-alomyr-hyperrealism-process",
    channel: "alomyr",
    titlePt: "O Processo Oculto do Hiper-realismo: Construindo Olhares Camada por Camada",
    titleEn: "The Hidden Process of Hyper-realism: Building Gazes Layer by Layer",
    summaryPt: "Uma reflexão sobre como o grafite sobre papel exige a mesma disciplina matemática do código: paciência microscópica, controle de pressão e renderização por gradientes.",
    summaryEn: "A reflection on how graphite on paper demands the same mathematical discipline as code: microscopic patience, pressure control, and gradient rendering.",
    category: "Hiper-realismo & Arte",
    tags: ["#Hiper-realismo", "#Grafite", "#ArteManual", "#ProcessoCriativo", "#Disciplina"],
    coverImage: "/IMG_3104.webp",
    youtubeUrl: "",
    galleryImages: [
      "/IMG_3104.webp",
      "/IMG_3110.webp",
      "/IMG_3112.webp",
      "/IMG_3114.webp"
    ],
    contentPt: `## A Convergência entre o Traço e o Algoritmo

Quando as pessoas olham para um desenho hiper-realista finalizado, costumam enxergar apenas a ilusão de tridimensionalidade. O que raramente se nota é que o hiper-realismo não nasce do virtuosismo impulsivo: ele nasce do método.

Assim como em uma rede neural profunda que ajusta gradientes microscópicos a cada época de treinamento, desenhar um olho realista em grafite exige dezenas de passagens suaves com graduações que vão do 2H ao 8B.

### A Lição da Paciência Iterativa
- **Camada Base (Luz):** Estabelecer a topologia geral e preservar os pontos de luz especular antes de aplicar qualquer tom escuro.
- **Fusão e Textura:** O esfuminho e o pincel macio eliminam o ruído dos poros do papel, gerando a transição suave de sombras.
- **Refinamento com Borracha Fina:** Cada poro, cada reflexo na íris e cada cílio é esculpido como uma linha de código limpa.`,
    contentEn: `## Where the Pencil Meets the Algorithm

When people look at a finished hyper-realistic drawing, they see the illusion of 3D depth. What goes unnoticed is that hyper-realism is not born of impulsive flair: it is born of rigorous method.

Just like a deep neural network fine-tuning gradients across thousands of epochs, drawing a hyper-realistic portrait demands iterative layers of graphite from 2H to 8B.`,
    relatedProjectId: "",
    author: "Matheus de Castro",
    publishedAt: "2026-11-04",
    readTime: "8 min",
    isPublished: true
  },
  {
    id: "post-alomyr-retrogaming-linux",
    channel: "alomyr",
    titlePt: "Retrogaming e Emulação no Linux: Por que Sistemas Antigos Ensinam Sobre Arquitetura",
    titleEn: "Retrogaming & Emulation on Linux: What Classic Systems Teach About Architecture",
    summaryPt: "Mergulho nos desafios de ciclo exato (cycle-accurate emulation), restrições extremas de hardware de 8 e 16 bits e como o Linux é o ecossistema definitivo para preservação de jogos.",
    summaryEn: "Diving into cycle-accurate emulation, extreme 8-bit/16-bit hardware constraints, and why Linux is the ultimate playground for digital game preservation.",
    category: "Retrogaming & Tech Geek",
    tags: ["#Retrogaming", "#Linux", "#Emulacao", "#GameDesign", "#Hardware", "#RetroArch"],
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    galleryImages: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80"
    ],
    contentPt: `## A Arte da Eficiência Sob Restrições Extremas

Programadores que construíram clássicos para consoles de 8 e 16 bits (NES, Super Nintendo, Mega Drive) operavam com poucos kilobytes de RAM e frequências de clock medidas em megahertz.

Para renderizar cenários vibrantes e sprites ágeis, eles utilizavam truques de interrupção de linha de varredura (*scanline interrupts*), paletas de cores indexadas e bancos de memória chaveados em tempo real (*bank switching*).

### Por que Montar um Setup de Emulação no Linux?
O ecossistema Linux moderno — aliado ao **RetroArch**, **KMS/DRM** e shaders de CRT com latência mínima (*Run-Ahead latency reduction*) — oferece a fidelidade mais próxima possível dos tubos de raios catódicos originais. É uma verdadeira aula viva de engenharia de computação aplicada.`,
    contentEn: `## The Elegance of Extreme Constraints

Engineers who coded 8-bit and 16-bit classics operated with mere kilobytes of RAM and single-digit MHz clocks.

Setting up cycle-accurate emulators on **Linux** using **RetroArch** and CRT shaders teaches unforgettable lessons about hardware abstraction, frame timing, and lean performance.`,
    relatedProjectId: "",
    author: "Matheus de Castro",
    publishedAt: "2026-10-30",
    readTime: "6 min",
    isPublished: true
  },
  {
    id: "post-alomyr-marvel-multiverse",
    channel: "alomyr",
    titlePt: "Quadrinhos Marvel e Multiversos: Uma Análise de Continuidade como Arquitetura de Sistemas",
    titleEn: "Marvel Comics & Multiverses: Viewing Continuity Through Systems Architecture",
    summaryPt: "Como mais de 60 anos de histórias interconectadas na Casa das Ideias funcionam como uma gigantesca base de dados distribuída com controle de versão e eventos canônicos.",
    summaryEn: "How 60+ years of interconnected stories operate like a massive distributed database with version control and canon timelines.",
    category: "Cultura Pop & Nerd",
    tags: ["#Marvel", "#Quadrinhos", "#Multiverso", "#GeekCulture", "#Narrativa"],
    coverImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
    youtubeUrl: "",
    galleryImages: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80"
    ],
    contentPt: `## Continuidade Narrativa como um Banco de Dados Distribuído

Desde a criação do Universo Marvel por Stan Lee e Jack Kirby na década de 1960, a editora estabeleceu um princípio revolucionário: todas as histórias acontecem no mesmo universo compartilhado (a Terra-616).

Quando analisamos essa continuidade pela ótica da Ciência da Computação, ela se comporta exatamente como um **banco de dados relacional distribuído**:
- **Retcons:** São equivalentes a *database migrations* retroativas para corrigir inconsistências de lógica ou alinhar lore.
- **Linhas Temporais Alternativas:** Funcionam como *branches* no Git (como a linha de Dias de um Futuro Esquecido ou a Era do Apocalipse).
- **Grandes Sagas:** Atuam como *major releases* que consolidam mudanças de estado global em todos os personagens simultaneamente.`,
    contentEn: `## Narrative Continuity as a Distributed Database

Since the 1960s, Marvel's interconnected universe (Earth-616) has evolved into one of the largest collaborative storytelling frameworks in human history.

Viewed through a computer science lens, it mirrors a **distributed database**: retcons are schema migrations, alternate realities are git branches, and summer crossover events are global state syncs.`,
    relatedProjectId: "",
    author: "Matheus de Castro",
    publishedAt: "2026-10-18",
    readTime: "5 min",
    isPublished: true
  },
  {
    id: "post-alomyr-philosophy-code",
    channel: "alomyr",
    titlePt: "A Dialética do Código e da Consciência: Onde a Filosofia Encontra a Máquina",
    titleEn: "The Dialectics of Code & Consciousness: Where Philosophy Meets the Machine",
    summaryPt: "Reflexões sobre a mente estendida, a natureza da cognição em tempos de modelos neurais profundos e a busca pelo sentido na engenharia diária.",
    summaryEn: "Reflections on extended mind theory, cognitive embodiment in the era of deep neural nets, and finding meaning in daily engineering.",
    category: "Filosofia & Pensamento",
    tags: ["#Filosofia", "#Mente", "#Cibernetica", "#Ensaios", "#Cognicao"],
    coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    youtubeUrl: "",
    galleryImages: [],
    contentPt: `## A Ferramenta que Remodela o Pensador

Em sua tese da *Mente Estendida*, Andy Clark e David Chalmers propõem que os objetos externos que utilizamos para processar informação tornam-se partes funcionais da nossa própria cognição.

Quando escrevemos software ou dialogamos com agentes de inteligência artificial, não estamos meramente executando tarefas mecânicas: estamos expandindo a fronteira de onde nosso pensamento começa e termina. A clareza de um código não é um capricho estético — é a prova de um pensamento que encontrou sua ordem interna.`,
    contentEn: `## The Tool That Reshapes the Thinker

In their *Extended Mind* hypothesis, Andy Clark and David Chalmers suggest that external artifacts we rely on for computation become active parts of our cognitive apparatus.

Writing code is not just mechanics: it is an externalization of internal mental models.`,
    relatedProjectId: "",
    author: "Matheus de Castro",
    publishedAt: "2026-10-08",
    readTime: "4 min",
    isPublished: true
  },
  {
    id: "post-portfolio-ecosystem",
    channel: "tech",
    titlePt: "Engenharia do Portfólio: Ecossistema de Blog Duplo, Vite Multi-Page e Inferência Segura com Qwen 3.8",
    titleEn: "Portfolio Engineering: Dual-Blog Ecosystem, Multi-Page Vite, and Secure Inference with Qwen 3.8",
    summaryPt: "Mergulho profundo na arquitetura técnica deste portfólio: zero segredos no cliente, Edge Functions para inferência isolada de LLMs, roteamento estático Vite e integração com Supabase.",
    summaryEn: "Deep-dive into this portfolio's technical architecture: zero client secrets, Edge Functions for isolated LLM inference, Vite multi-page routing, and Supabase integration.",
    category: "Machine Learning & Backend",
    tags: ["#React", "#Supabase", "#Vite", "#AI Agent", "#Architecture", "#Cloud"],
    coverImage: "/portfolio-preview.png",
    youtubeUrl: "",
    galleryImages: ["/portfolio-preview.png"],
    contentPt: `## Arquitetura Moderna de Alta Performance

Este portfólio foi desenhado com o compromisso de aliar a síntese visual de uma vitrine profissional de tecnologia à profundidade analítica de um ecossistema de conteúdo técnico e laboratório criativo.

![Visão Geral da Interface do Portfólio](/portfolio-preview.png)

### 1. Isolamento de Inferência & Zero Segredos no Navegador
A grande inovação de segurança nesta versão é a eliminação completa de qualquer chave sensível no \`localStorage\` ou código cliente. A inferência de IA utiliza o modelo de última geração **Qwen 3.8 27B** através de Edge Functions serverless no Supabase:
- O frontend despacha apenas o histórico contextualizado.
- A borda da nuvem valida guardrails anti-injection e aplica limites estritos de taxa.
- Respostas são devolvidas com latência sub-centésimo de segundo (<80ms).

### 2. Ecossistema de Blog Duplo (Split Gateway)
Navegação segmentada entre dois mundos:
1. **Canal de Engenharia & IA (\`/blog\`):** Artigos aprofundados, benchmarks de LLM, pipelines de visão computacional e arquiteturas de backend.
2. **Laboratório Alomyr (\`/blog/alomyr\`):** Hiper-realismo artístico, rotinas de retrogaming no Linux e ensaios filosóficos sobre código e consciência.

### 3. Roteamento Multi-Page no Vite
Adoção de compilação multi-page estática com Rollup:
\`\`\`javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, '4dm1n/index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        blogAlomyr: resolve(__dirname, 'blog/alomyr/index.html')
      }
    }
  }
});
\`\`\`
Isso assegura recarregamentos limpos (F5) em qualquer rota em servidores estáticos como o GitHub Pages.`,
    contentEn: `## High-Performance Modern Architecture

This portfolio was designed to combine the visual synthesis of a professional showcase with the analytical depth of an engineering blog and creative lab.

![Portfolio Interface Overview](/portfolio-preview.png)

### 1. Inference Isolation & Zero Client Secrets
The primary security milestone of this release is eliminating all API keys from browser storage. AI inference runs **Qwen 3.8 27B** through serverless Supabase Edge Functions:
- Client code dispatches only clean message histories.
- Cloud edge enforces prompt injection guardrails and rate limiting.
- Output arrives with sub-100ms response latency.

### 2. Dual-Blog Ecosystem (Split Gateway)
Structured into two distinct editorial paths:
1. **Engineering & AI Channel (\`/blog\`):** Deep dives, LLM telemetry, computer vision pipelines, and scalable backend design.
2. **Alomyr Creative Lab (\`/blog/alomyr\`):** Hyper-realistic pencil drawing, Linux retrogaming, and philosophy of mind.

### 3. Vite Multi-Page Static Builds
Configured with dedicated HTML entrypoints for direct URL reloads on GitHub Pages without single-page fallback issues.`,
    relatedProjectId: "portfolio-ecosystem",
    relatedArticleId: null,
    author: "Matheus de Castro",
    publishedAt: "2026-11-05",
    readTime: "5 min",
    isPublished: true
  }
];

const BLOG_STORAGE_KEY = "portfolio_blog_posts_v1";

export function getStoredBlogPosts() {
  try {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Falha ao ler blog posts locais:", err);
  }
  return DEFAULT_BLOG_POSTS;
}

export function saveBlogPosts(posts) {
  try {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error("Erro ao salvar blog posts:", err);
  }
}

/**
 * Helper para extrair URL segura de embed do YouTube (ou retornar null)
 */
export function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}`;
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube-nocookie.com/embed/${trimmed}`;
  }
  return null;
}
