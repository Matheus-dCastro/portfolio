# ⚡ Matheus de Castro | Portfólio, Ecossistema de Blog & Agente IA

> Plataforma web de alta performance construída para unir o rigor da engenharia de software e inteligência artificial com a sensibilidade estética da arte e cultura geek.

[![Acesse matheusdecastro.com](https://img.shields.io/badge/Website-matheusdecastro.com-8b5cf6?style=for-the-badge&logo=googlechrome&logoColor=white)](https://matheusdecastro.com/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-10b981?style=for-the-badge&logo=github)](https://matheusdecastro.com/)
[![Supabase Cloud](https://img.shields.io/badge/Backend-Supabase%20Cloud-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)

---

## 🏛️ Visão Geral da Arquitetura: Antes vs. Agora

Abaixo está o comparativo detalhado da evolução estrutural e de segurança do projeto:

| Dimensão | Arquitetura Anterior (Legada) | Nova Arquitetura (Atual) | Impacto no Uso / Segurança |
| :--- | :--- | :--- | :--- |
| **Segurança & Secrets** | Chaves de API salvas no `localStorage` do browser | **Zero Secrets no Client-Side**. Inferência isolada na nuvem via Supabase Edge Function (`/chat-qwen`) | Elimina qualquer risco de vazamento de credenciais ou sequestro de cotas por scripts de terceiros (XSS). |
| **Backend & Dados** | Arquivos estáticos em memória com fallbacks no `localStorage` | **Supabase Cloud (PostgreSQL)** + Storage Bucket para imagens de alta resolução | Persistência multi-dispositivo em tempo real, capacidade de expansão e integridade relacional. |
| **Ecossistema de Conteúdo** | Apenas vitrine de projetos e pensamentos curtos na home | **Ecossistema de Blog Duplo** com Split Gateway (`/blog/?`) + Canal Tech (`/blog`) + Canal Lab (`/blog/alomyr`) | Separação semântica clara entre artigos sérios de computação/IA e produções de hiper-realismo/cultura pop. |
| **Layout & Feed do Blog** | Feed básico em lista | Layout editorial inspirado no portal **Ei Nerd** (Manchete Principal / Lead Story + Tópicos em Alta + Grid Editorial) | Engajamento visual premium, badges de mídias ricas (vídeos YouTube, galerias de fotos) e leitura imersiva. |
| **Assistente de IA (Alomyr)** | Chat popup isolado na home com contexto genérico | Agente serverless com **RAG Contextualizado** em cada tela de "Saber Mais" dos projetos e posts | O visitante tira dúvidas técnicas específicas sobre a arquitetura do projeto ou artigo que está lendo. |
| **Roteamento Estático** | SPA pura com risco de erro 404 ao dar F5 em sub-rotas | Multi-Page Static Build no **Vite** (`blog/index.html`, `blog/alomyr/index.html`, `4dm1n/index.html`, `404.html`) | Recarregamento direto de URLs limpas (F5) em hospedagem estática global (GitHub Pages / CDN). |
| **Gestão Administrativa** | Nenhuma interface administrativa dinâmica | **Dashboard Restrito (`/4dm1n`)** com abas de moderação de blog, ordenação drag-and-drop e upload direto | Gestão autônoma de conteúdo em tempo real sem necessidade de novo commit/deploy a cada postagem. |
| **Internacionalização** | Chaveamento manual | **Detecção Automática** do idioma do navegador (`pt` / `en`) com persistência de preferência e toggle suave | Experiência nativa imediata tanto para recrutadores internacionais quanto para visitantes brasileiros. |

---

## 🌐 Comparativo de Hospedagem & Infraestrutura

```text
                                  ┌────────────────────────────────────────┐
                                  │   Visitante (Browser / Dispositivo)    │
                                  └───────────────────┬────────────────────┘
                                                      │
                                                      ▼
                       ┌─────────────────────────────────────────────────────────────┐
                       │                   GitHub Pages (Edge CDN)                   │
                       │           matheusdecastro.com (Certificado SSL)            │
                       ├─────────────────────────────────────────────────────────────┤
                       │  • HTML estático multi-page gerado pelo Vite               │
                       │  • CSS Cyber-Minimal com Glassmorphism                      │
                       │  • React 18 SPA hidratada + roteamento no cliente           │
                       │  • Zero chaves privadas ou tokens no bundle                 │
                       └──────────────────────┬──────────────────────┬───────────────┘
                                              │                      │
                   Consultas públicas / Postagens                     Chamadas de IA
                                              │                      │
                                              ▼                      ▼
                       ┌────────────────────────────────┐  ┌─────────────────────────┐
                       │     Supabase Cloud (REST)      │  │  Supabase Edge Function │
                       │    PostgreSQL + Storage CDN    │  │       (/chat-qwen)      │
                       ├────────────────────────────────┤  ├─────────────────────────┤
                       │  • Tabela 'blog_posts'         │  │  • Execução Serverless  │
                       │  • Tabela 'projects'           │  │  • Secret GROQ_API_KEY  │
                       │  • Bucket 'portfolio-assets'   │  │  • Modelo Qwen 2.5 32B  │
                       │  • Row Level Security (RLS)    │  │  • Prompt e Guardrails  │
                       └────────────────────────────────┘  └─────────────────────────┘
```

### 1. Camada Frontend (GitHub Pages)
* **Objetivo:** Entrega estática ultrarrápida com latência mínima através da CDN mundial do GitHub.
* **Segurança:** O código compilado na pasta `dist` é 100% público. Não armazena nenhuma chave de API secreta nem credenciais administrativas.
* **Multi-Page Entrypoints:** O Vite gera páginas dedicadas (`/`, `/blog`, `/blog/alomyr`, `/4dm1n`, `/contacts`, `/draft-view`, `/draft-order`), assegurando compatibilidade com servidores estáticos.

### 2. Camada Backend & IA (Supabase Cloud)
* **Objetivo:** Persistência relacional em PostgreSQL, autenticação segura e computação serverless em TypeScript (Deno runtime).
* **Edge Function `/chat-qwen`:** Atua como proxy de inferência. A chave da API da Groq (`GROQ_API_KEY`) é guardada como secret protegida no cofre de variáveis da nuvem Supabase (`supabase secrets set`), inacessível ao cliente.

---

## 💻 Tecnologias & Ferramentas Utilizadas

* **Frontend & Build:** React 18, Vite 6, JavaScript moderno (ES6+), CSS3 Puro, HTML5.
* **Backend & Serverless:** Supabase Cloud, PostgreSQL, Deno / TypeScript Edge Functions.
* **Inteligência Artificial:** Qwen 2.5 32B Coder (Groq Cloud Inference), Prompts Contextualizados e Guardrails de Segurança.
* **Design & Estilo:** Cyber-Minimalism, Glassmorphism (`backdrop-filter`), responsividade mobile-first, Dark Theme com realces em Ciano Elétrico (`#06b6d4`) e Violeta Neon (`#8b5cf6`).
* **Deploy & CI/CD:** GitHub Actions / GitHub Pages com domínio personalizado (`matheusdecastro.com`).

---

## 📁 Estrutura de Pastas

```text
├── public/                       # Arquivos estáticos globais e manifestos
│   ├── CNAME                     # Apontamento de domínio próprio
│   ├── portfolio-preview.png     # Screenshot da interface para embeds
│   ├── ultrawide_onda_roxa.png   # Arte de fundo ultrawide
│   └── wolf(2).png               # Mascote Alomyr em alta resolução
├── supabase/                     # Infraestrutura serverless Supabase
│   └── functions/
│       └── chat-qwen/
│           └── index.ts          # Edge Function de inferência protegida da IA
├── src/
│   ├── assets/img/               # Galeria de desenhos e imagens de projetos
│   ├── components/               # Módulos reutilizáveis de interface
│   │   ├── AdminDraft.jsx        # Painel Administrativo (/4dm1n)
│   │   ├── ArtGallery.jsx        # Galeria de hiper-realismo com lightbox
│   │   ├── BlogGateway.jsx       # Gateway intermediário (/blog/?)
│   │   ├── BlogPage.jsx          # Feed editorial estilo Ei Nerd e Leitor de posts
│   │   ├── Experience.jsx        # Linha do tempo interativa de experiências
│   │   ├── HeadSite.jsx          # Navbar flutuante com espaçamento refinado
│   │   ├── LanguageSwitcher.jsx  # Seletor de idiomas PT/EN
│   │   ├── Perfil.jsx            # Hero com foto, introdução e links rápidos
│   │   ├── Projects.jsx          # Vitrine de projetos em destaque
│   │   ├── ShareButton.jsx       # Botão de compartilhamento dinâmico
│   │   ├── Skills.jsx            # Matriz de habilidades e frameworks
│   │   └── ViewDraft.jsx         # Tela "Saber Mais" com Alomyr contextual
│   ├── context/                  # Estados globais (LanguageContext, etc.)
│   ├── data/                     # Dados padrão (projetos, blog, artes, templates)
│   │   ├── blogData.js           # Estrutura do ecossistema do blog
│   │   └── projectsData.js       # Repositório de projetos e experiências
│   ├── lib/                      # Conectores e serviços externos
│   │   ├── llmService.js         # Invocador serverless da Edge Function
│   │   ├── supabaseClient.js     # Cliente Supabase tipado
│   │   ├── supabaseService.js    # CRUD de posts, projetos e storage
│   │   └── translations.js       # Dicionário bilíngue (Português / Inglês)
│   ├── App.jsx                   # Gerenciador mestre de rotas e modais
│   ├── main.jsx                  # Ponto de entrada React
│   └── style.css                 # Folha de estilos unificada
├── KANBAN_MIGRACAO_5_DIAS.md     # Registro cronológico detalhado dos 32 passos
└── vite.config.js                # Configuração do compilador multi-page
```

---

## 🛠️ Como Executar Localmente

### 1. Clonar o Repositório
```bash
git clone https://github.com/Matheus-dCastro/portfolio.git
cd portfolio
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=https://sua-url-supabase.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-publica
```

### 4. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
O projeto estará disponível em `http://localhost:5173/`.

### 5. Compilar para Produção
```bash
npm run build
```

---

## 🔒 Segurança da Edge Function (Deploy no Supabase)

Para atualizar a função de IA na nuvem Supabase:

```bash
# 1. Definir a chave secreta da Groq no cofre em nuvem (inacessível no frontend)
npx supabase secrets set GROQ_API_KEY=sua_chave_groq_aqui

# 2. Fazer deploy da função
npx supabase functions deploy chat-qwen --no-verify-jwt
```

---

## 📩 Contato & Redes

* **Website Oficial:** [matheusdecastro.com](https://matheusdecastro.com/)
* **LinkedIn:** [linkedin.com/in/matheus-dcastro](https://www.linkedin.com/in/matheus-dcastro)
* **GitHub:** [@Matheus-dCastro](https://github.com/Matheus-dCastro)
* **E-mail:** [matheus.vsf.castro.25@gmail.com](mailto:matheus.vsf.castro.25@gmail.com)

---
*Construído com código limpo, cafeína e atenção milimétrica por Matheus de Castro (Alomyr).*
