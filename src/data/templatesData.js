// src/data/templatesData.js
// Modelos pré-prontos para escrita e documentação rápida (estilo Obsidian & Word)

export const DOCUMENT_TEMPLATES = [
  {
    id: "ml-project",
    name: "🧠 Projeto de Machine Learning / IA",
    description: "Estrutura completa com formulação do problema, arquitetura de rede neural, pipeline de dados, métricas e avaliação.",
    category: "Acadêmico",
    defaultTags: "Deep Learning, Python, PyTorch, MLOps",
    defaultSummary: "Solução de inteligência artificial com pipeline ponta a ponta, desde a ingestão de dados até métricas quantitativas de inferência.",
    content: `# [Nome do Modelo / Projeto de IA]

## 🎯 1. Visão Geral & Problema
Descreva sucintamente o problema de negócio ou científico que este modelo busca resolver.
- **Domínio:** [Ex: Visão Computacional / Processamento de Linguagem Natural]
- **Objetivo Principal:** [Ex: Reduzir falsos positivos em 20%]
- **Entrada (Input):** [Ex: Imagens 512x512 em escala de cinza / Prompts de texto]
- **Saída (Output):** [Ex: Máscara binária de segmentação / Probabilidade de classe]

---

## 🔬 2. Dataset & Pré-processamento
- **Fonte de Dados:** [Nome da base ou URL do dataset]
- **Volume:** [Quantidade de amostras, classes e proporção de treino/validação/teste]
- **Tratamento:** Normalização, filtragem de ruído e ampliação (*Data Augmentation*).

---

## 🏗️ 3. Arquitetura da Rede Neural
\`\`\`text
[Input] -> [Encoder / Backbone] -> [Bottleneck] -> [Decoder com Skip Connections] -> [Output]
\`\`\`
- **Backbone:** [Ex: ResNet-50 / U-Net / Qwen-2.5]
- **Função de Perda (*Loss*):** [Ex: Focal Loss + Dice Loss]
- **Otimizador:** AdamW (\`lr=1e-4\`, \`weight_decay=1e-2\`)

---

## 📊 4. Resultados & Métricas Experimentais
| Métrica | Benchmark / Baseline | Nosso Modelo | Ganho (%) |
| :--- | :--- | :--- | :--- |
| **Acurácia / F1-Score** | 82.4% | **91.8%** | +11.4% |
| **Latência (ms/inferência)** | 140ms | **45ms** | -67.8% |
| **Loss Final** | 0.342 | **0.118** | -65.5% |

> "A adoção de attention gates no decoder suprimiu falsas detecções em áreas de baixo contraste."

---

##  5. Como Reproduzir e Executar
\`\`\`bash
# 1. Instale as dependências
pip install -r requirements.txt

# 2. Execute a inferência com pesos pré-treinados
python run_inference.py --weights checkpoint_best.pth --input data/sample.png
\`\`\`
`
  },
  {
    id: "backend-api",
    name: "⚡ Projeto Backend & Engenharia de Software",
    description: "Modelo focado em arquitetura de microsserviços, contratos de API, modelagem de banco de dados e boas práticas.",
    category: "Profissional",
    defaultTags: "FastAPI, PostgreSQL, Docker, Clean Architecture",
    defaultSummary: "Arquitetura backend resiliente orientada a serviços com validação rígida de tipos e persistência relacional transacional.",
    content: `# [Nome do Serviço ou Backend API]

## 📌 1. Visão Geral do Sistema
Explique o papel deste serviço no ecossistema global de software.
- **Protocolos:** RESTful HTTP/JSON e WebSockets assíncronos.
- **Segurança:** Autenticação via JWT, limitação de taxa (*Rate Limiting*) e sanitização de requisições.

---

## 🏛️ 2. Arquitetura de Software
Adota princípios da *Clean Architecture*:
1. **Domain:** Entidades puras de negócio independentes de frameworks.
2. **Use Cases:** Regras de orquestração de operações de dados.
3. **Adapters / Repositories:** Comunicação com o PostgreSQL e serviços externos.
4. **Controllers & Routers:** Endpoints HTTP validados com Pydantic / DTOs.

---

## 🗄️ 3. Modelo de Dados (PostgreSQL)
\`\`\`sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

---

## 📡 4. Principais Endpoints da API
- \`POST /api/v1/auth/token\` — Emissão e renovação de tokens JWT.
- \`GET /api/v1/resources\` — Listagem paginada com suporte a filtros e ordenação dinâmica.
- \`POST /api/v1/resources\` — Criação atômica de novo recurso validado.

---

## 📦 5. Instalação e Execução
\`\`\`bash
# Configurar variáveis de ambiente
cp .env.example .env

# Subir banco de dados e servidor
docker-compose up -d --build
\`\`\`
`
  },
  {
    id: "scientific-paper",
    name: " Artigo Científico / Paper Técnico",
    description: "Estrutura acadêmica formal com Abstract, Introdução, Trabalhos Relacionados, Metodologia, Discussão e Referências.",
    category: "Acadêmico",
    defaultTags: "Pesquisa, Engenharia, Artigo Técnico, UFRN",
    defaultSummary: "Artigo de investigação metodológica e científica com formulação matemática e análise crítica de experimentos.",
    content: `# [Título Acadêmico Completo do Artigo]
**Autor:** Matheus de Castro  
**Afiliação:** Universidade Federal do Rio Grande do Norte (UFRN) — Departamento de Informática e Matemática Aplicada (DIMAp)

---

### Resumo (*Abstract*)
*Este artigo investiga métodos computacionais avançados aplicados à resolução de gargalos operacionais em sistemas inteligentes. Através de formulações estatísticas rigorosas e validação cruzada k-fold, demonstra-se a eficácia da abordagem proposta, alcançando convergência superior e estabilidade numérica.*

**Palavras-chave:** Aprendizado de Máquina, Otimização Numérica, Arquitetura de Sistemas.

---

## 1. Introdução
A crescente demanda por sistemas autônomos com previsibilidade temporal impõe novos desafios às técnicas convencionais de computação. Esta pesquisa tem como escopo preencher a lacuna entre a modelagem teórica e o emprego de algoritmos estocásticos em escala.

## 2. Trabalhos Relacionados
Diversos autores na literatura recente exploraram abordagens semelhantes, no entanto negligenciaram fatores cruciais de latência e consumo energético em hardware heterogêneo.

## 3. Metodologia Proposta
A metodologia divide-se em três etapas sequenciais:
1. Formalização do espaço amostral.
2. Dedução analítica da função objetivo.
3. Execução de simulações com controle de variáveis espúrias.

$$ f(x) = \\sum_{i=1}^{n} w_i \\cdot \\phi(x_i) + \\epsilon $$

## 4. Resultados e Discussão
Os resultados apontam conformidade com a hipótese inicial formulada, superando abordagens clássicas em 14.7% de precisão média.

## 5. Conclusão
O estudo estabelece um novo patamar de eficiência para aplicações futuras no contexto acadêmico e industrial.

## 6. Referências
1. Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep Learning*. MIT Press.
2. Ronneberger, O., Fischer, P., & Brox, T. (2015). *U-Net: Convolutional Networks for Biomedical Image Segmentation*. MICCAI.
`
  },
  {
    id: "github-readme",
    name: " README Completo de Repositório (Open Source)",
    description: "Modelo padrão da indústria para GitHub com badges, preview, funcionalidades, stack e instruções de contribuição.",
    category: "Profissional",
    defaultTags: "GitHub, Open Source, Documentação, README",
    defaultSummary: "README estruturado e persuasivo para valorizar o projeto e guiar desenvolvedores e recrutadores no GitHub.",
    content: `# 🌟 [Nome do Projeto]

<p align="center">
  <img src="https://img.shields.io/badge/Status-Ativo-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="Licença" />
</p>

> Uma descrição em uma frase poderosa explicando o propósito do seu projeto.

---

## 💡 Principais Funcionalidades
- ⚡ **Alta Velocidade:** Processamento assíncrono projetado para mínima sobrecarga.
- 🛡️ **Segurança por Padrão:** Sanitização rigorosa e validação de esquemas.
- 🧩 **Design Modular:** Fácil extensão via plugins ou novos adaptadores.
- 📊 **Métricas Transparentes:** Logs estruturados e métricas prontas para Prometheus.

---

## 🛠️ Tecnologias Utilizadas
- **Linguagem Principal:** Python / C++ / TypeScript
- **Framework:** FastAPI / PyTorch / React
- **Banco de Dados:** PostgreSQL
- **DevOps:** Docker, GitHub Actions CI/CD

---

## ⚡ Início Rápido
\`\`\`bash
# Clone este repositório
git clone https://github.com/Matheus-dCastro/[nome-do-repo].git

# Entre no diretório
cd [nome-do-repo]

# Execute o setup
npm install # ou pip install -r requirements.txt
\`\`\`

---

## 🤝 Como Contribuir
Contribuições são muito bem-vindas!
1. Faça um Fork do projeto.
2. Crie uma branch para sua feature (\`git checkout -b feature/minha-feature\`).
3. Commit suas alterações (\`git commit -m 'feat: minha nova feature'\`).
4. Abra um Pull Request detalhado.

---

## 📜 Licença
Distribuído sob a licença MIT. Consulte \`LICENSE\` para maiores detalhes.
`
  },
  {
    id: "quick-tutorial",
    name: "💡 Artigo de Tutorial Prático / How-to",
    description: "Passo a passo didático com blocos de código comentados, alertas e dicas de resolução de problemas comuns.",
    category: "Pessoal",
    defaultTags: "Tutorial, Dicas, Engenharia, Guia",
    defaultSummary: "Guia prático e focado na resolução de um problema técnico específico com exemplos de código prontos.",
    content: `# [Como Implementar X com Eficiência Usando Y]

Neste guia direto ao ponto, você aprenderá exatamente como configurar e otimizar [Nome da Tecnologia] sem rodeios desnecessários.

---

## 📋 Pré-requisitos
Antes de começar, certifique-se de ter instalado:
- Ambiente configurado com a versão estável.
- Conhecimentos básicos de terminal e Git.

---

##  Passo 1: Configuração Inicial
O primeiro passo consiste em inicializar o ambiente isolado:
\`\`\`bash
mkdir meu-projeto && cd meu-projeto
git init
\`\`\`

---

## ⚙️ Passo 2: Implementando a Lógica Central
Observe a função a seguir, projetada com tratamento de exceções:

\`\`\`python
def process_data_stream(stream):
    """Processa o fluxo garantindo integridade de memória."""
    for chunk in stream:
        if not chunk.is_valid():
            continue
        yield chunk.transform()
\`\`\`

> 💡 **Dica de Performance:** Utilize geradores (\`yield\`) sempre que manipular grandes volumes para evitar saturação de memória RAM.

---

## 🎯 Conclusão
Com esses passos, sua implementação está pronta para operar com estabilidade e previsibilidade.
`
  },
  {
    id: "study-thought",
    name: "💭 Nota de Estudo & Pensamento (Obsidian Style)",
    description: "Modelo minimalista e ágil para catalogar pensamentos profundos, resumos conceituais e conexões interdisciplinares.",
    category: "Pessoal",
    defaultTags: "Pensamento, Filosofia, Arquitetura, Aprendizado",
    defaultSummary: "Registro sintético de um insight ou reflexão sobre engenharia, ciência e processos criativos.",
    content: `# [Título do Pensamento ou Insight]
*Data: [Data de hoje] | Tópico: Filosofia de Software & Precisão*

---

### O Conceito Chave
Qual é a ideia central que provocou esta reflexão? Escreva aqui em um ou dois parágrafos transparentes e densos.

### Conexão Interdisciplinar
Como esta constatação técnica se relaciona com outras esferas (como desenho hiper-realista, artes, matemática ou liderança)?

- **Princípio 1:** Menos é mais quando a estrutura é sólida.
- **Princípio 2:** O erro antecipado em testes custa 100x menos do que o erro em produção.

---

### Citação / Referência Inspiradora
> "A simplicidade é pré-requisito para a confiabilidade." — Edsger W. Dijkstra

---

### Próximos Passos
- [ ] Explorar aplicação prática deste conceito no projeto [Nome].
- [ ] Ler o artigo recomendado pelo professor.
`
  }
];
