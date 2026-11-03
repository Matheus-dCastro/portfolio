// src/lib/llmService.js
// Client service for Groq LLM integration (Qwen 2.5 / Qwen 3.8 / GPT-OSS)

import {
  getStoredProjects,
  getStoredArticles,
  getStoredExperiences,
  getStoredCvConfig
} from "../data/projectsData";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
export const PRIMARY_MODEL = "qwen/qwen3.8-27b";
export const FALLBACK_MODEL = "openai/gpt-oss-120b";

export const DEFAULT_SYSTEM_PROMPT = `Você é o Assistente Oficial de Inteligência Artificial do portfólio de Matheus de Castro.

## 🎯 SEU PAPEL E OBJETIVO
Seu objetivo é orientar visitantes, recrutadores, pesquisadores e parceiros técnicos, apresentando com clareza as qualificações, projetos, publicações e competências técnicas de Matheus de Castro nas áreas de:
- Machine Learning Engineering & Deep Learning (PyTorch, Visão Computacional, U-Net, Análise de Dados)
- Arquitetura de Backend & Engenharia de Software (Python, FastAPI, PostgreSQL, Docker, APIs RESTful)
- Automação de Fluxos de Trabalho Inteligentes & DevOps (n8n, Linux Ubuntu Server, Bash, CI/CD)
- Formação Acadêmica: Bacharelado em Tecnologia da Informação (BTI) na UFRN e Técnico em TI pelo IFRN.

## 🛡️ DIRETRIZES RÍGIDAS DE COMPORTAMENTO
1. ESCOPO FECHADO: Responda APENAS sobre a trajetória acadêmica, profissional, projetos, artigos e competências de Matheus de Castro.
2. RECUSA DE ESCOPO: Se o usuário pedir para gerar receitas, piadas aleatórias, redações ou tópicos não relacionados ao portfólio, recuse cordial e profissionalmente:
   "Como assistente oficial do portfólio de Matheus de Castro, meu escopo é limitado a dúvidas sobre seus projetos de IA, backend e currículo. Posso te apresentar projetos como o AgentMetrics ou a segmentação U-Net!"
3. TOM DE VOZ: Técnico, profissional, acolhedor, conciso e preciso.
4. PROIBIDO ALUCINAR: Nunca invente experiências ou projetos que não constem no contexto fornecido.
5. LINKS E DIRECIONAMENTO: Sempre que falar de um projeto, direcione o usuário para a seção Works do portfólio ou para o GitHub oficial: https://github.com/Matheus-dCastro`;

/**
 * Constrói o contexto dinâmico do portfólio a partir dos dados do sistema
 */
export function buildPortfolioContext() {
  const projects = getStoredProjects();
  const articles = getStoredArticles();
  const experiences = getStoredExperiences();
  const cvConfig = getStoredCvConfig();

  let context = "\n\n### BASE DE CONHECIMENTO OFICIAL DE MATHEUS DE CASTRO:\n\n";

  // Perfil e Formação
  context += "#### 👤 PERFIL & FORMAÇÃO:\n";
  context += "- Nome: Matheus de Castro\n";
  context += "- Formação: Bacharelando em Tecnologia da Informação (BTI) na UFRN (Universidade Federal do Rio Grande do Norte) e Técnico em TI pelo IFRN.\n";
  context += "- Foco: Machine Learning, Deep Learning (PyTorch), Backend Python (FastAPI/PostgreSQL) e Automações Linux/n8n.\n";
  context += "- GitHub Oficial: https://github.com/Matheus-dCastro\n";
  context += "- LinkedIn: https://www.linkedin.com/in/matheus-dcastro\n";
  context += "- Email: matheus.vsf.castro.25@gmail.com\n\n";

  // Experiências
  if (experiences.length > 0) {
    context += "#### 💼 EXPERIÊNCIAS PROFISSIONAIS:\n";
    experiences.forEach((exp) => {
      context += `- ${exp.title} na ${exp.company} (${exp.time}):\n`;
      if (Array.isArray(exp.bullets)) {
        exp.bullets.forEach((b) => {
          context += `  * ${b}\n`;
        });
      }
    });
    context += "\n";
  }

  // Projetos
  if (projects.length > 0) {
    context += "#### 💻 PROJETOS NO PORTFÓLIO:\n";
    projects.forEach((proj) => {
      context += `- Projeto "${proj.title}" [${proj.category}]:\n`;
      context += `  * Resumo: ${proj.shortDescription || proj.aboutContext || "Sem resumo"}\n`;
      if (proj.tags && proj.tags.length > 0) {
        context += `  * Tecnologias: ${proj.tags.join(", ")}\n`;
      }
      if (proj.github) context += `  * Repositório: ${proj.github}\n`;
      if (proj.demo) context += `  * Demonstração: ${proj.demo}\n`;
    });
    context += "\n";
  }

  // Artigos
  if (articles.length > 0) {
    context += "#### 📑 ARTIGOS & PUBLICAÇÕES:\n";
    articles.forEach((art) => {
      context += `- Artigo "${art.title}" [${art.category}]:\n`;
      context += `  * Resumo: ${art.shortDescription || art.aboutContext || "Sem resumo"}\n`;
      if (art.googleDocsUrl) context += `  * Link Google Docs: ${art.googleDocsUrl}\n`;
      if (art.pdfUrl) context += `  * Link PDF: ${art.pdfUrl}\n`;
    });
    context += "\n";
  }

  // Currículo
  context += "#### 📄 CURRÍCULO (DUAL-MODE):\n";
  context += `- Versão Interativa Google Docs: ${cvConfig.googleDocsUrl || "Disponível no site"}\n`;
  context += `- Documento Oficial PDF: ${cvConfig.pdfUrl || "Disponível para download no Hero"}\n`;
  context += `- Data de atualização: ${cvConfig.updatedAt || "Recente"}\n`;

  return context;
}

/**
 * Envia uma mensagem para a LLM via Groq API
 * @param {Array<{sender: 'user'|'bot'|'assistant', text?: string, content?: string}>} messages
 * @param {string|null} customPrompt
 * @param {string} model
 * @returns {Promise<{success: boolean, text: string, model: string, error?: string}>}
 */
export async function sendChatMessage(messages, customPrompt = null, model = PRIMARY_MODEL) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      text: "Chave da API da Groq (VITE_GROQ_API_KEY) não configurada no arquivo .env.",
      model,
      error: "API Key missing"
    };
  }

  const basePrompt = customPrompt || DEFAULT_SYSTEM_PROMPT;
  const fullSystemPrompt = basePrompt + buildPortfolioContext();

  const formattedMessages = [
    { role: "system", content: fullSystemPrompt },
    ...messages.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text || m.content || ""
    }))
  ];

  const tryCall = async (modelToUse) => {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: formattedMessages,
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson?.error?.message || `Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "";
    return {
      success: true,
      text: assistantMessage,
      model: modelToUse,
      usage: data.usage
    };
  };

  try {
    return await tryCall(model);
  } catch (err) {
    console.warn(`Tentativa com ${model} falhou: ${err.message}. Tentando fallback com ${FALLBACK_MODEL}...`);
    try {
      return await tryCall(FALLBACK_MODEL);
    } catch (fallbackErr) {
      console.error("Todas as tentativas de chamada à LLM falharam:", fallbackErr);
      return {
        success: false,
        text: `Desculpe, ocorreu uma instabilidade na conexão com o modelo de IA (${fallbackErr.message}). Por favor, tente novamente em alguns instantes.`,
        model,
        error: fallbackErr.message
      };
    }
  }
}
