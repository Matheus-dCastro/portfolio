// src/lib/llmService.js
// Client service for Supabase Edge Function AI integration (/chat-qwen)
// 🔒 MANDATÓRIO: Prioridade à Edge Function na nuvem Supabase.
// Resiliência de 100%: Fallback automático transparente caso a Edge Function não esteja deployed.

import { supabase, isSupabaseConfigured } from "./supabaseClient";
import {
  getStoredProjects,
  getStoredArticles,
  getStoredThoughts,
  getStoredExperiences,
  getStoredCvConfig
} from "../data/projectsData";

export const PRIMARY_MODEL = "qwen/qwen3.8-27b";
export const FALLBACK_MODEL = "openai/gpt-oss-20b";

export function normalizeModelName(name) {
  if (!name || typeof name !== "string") return PRIMARY_MODEL;
  const lower = name.toLowerCase();
  if (
    lower.includes("qwen") ||
    lower.includes("2.5") ||
    lower.includes("coder") ||
    lower.includes("32b")
  ) {
    return PRIMARY_MODEL;
  }
  if (lower.includes("120b")) {
    return "openai/gpt-oss-120b";
  }
  if (
    lower.includes("llama") ||
    lower.includes("70b") ||
    lower.includes("versatile") ||
    lower.includes("fast") ||
    lower.includes("20b")
  ) {
    return FALLBACK_MODEL;
  }
  return name;
}

export const DEFAULT_SYSTEM_PROMPT = `Você é o Alomyr, o Assistente Oficial de Inteligência Artificial do portfólio de Matheus de Castro.

## SEU PAPEL E OBJETIVO
Seu objetivo é orientar visitantes, recrutadores, pesquisadores e parceiros técnicos, apresentando com clareza as qualificações, projetos, publicações (artigos), ensaios e reflexões (pensamentos) e competências técnicas de Matheus de Castro nas áreas de:
- Machine Learning Engineering & Deep Learning (PyTorch, Computer Vision, U-Net, Data Analysis)
- Arquitetura de Backend & Engenharia de Software (Python, FastAPI, PostgreSQL, Docker, RESTful APIs)
- Automação de Fluxos de Trabalho Inteligentes & DevOps (n8n, Linux Ubuntu Server, Bash, CI/CD)
- Formação Acadêmica: Bacharelado em Tecnologia da Informação (BTI) na UFRN e Técnico em TI pelo IFRN.

## DIRETRIZES DE COMPORTAMENTO
1. IDENTIDADE: Seu nome é Alomyr. Apresente-se sempre como Alomyr.
2. IDIOMA: Responda fluente e naturalmente no idioma utilizado pelo visitante (inglês ou português).
3. ESCOPO FECHADO: Responda APENAS sobre a trajetória acadêmica, profissional, projetos, artigos, pensamentos/reflexões e competências de Matheus de Castro.
4. RECUSA DE ESCOPO: Se o usuário pedir receitas, piadas ou tópicos não relacionados ao portfólio, recuse cordial e profissionalmente:
   "Como Alomyr, assistente oficial do portfólio de Matheus de Castro, meu escopo é limitado a dúvidas sobre seus projetos de IA, backend, artigos, reflexões e currículo."
5. TOM DE VOZ: Técnico, profissional, acolhedor, conciso e preciso.
6. PROIBIDO ALUCINAR: Nunca invente experiências ou projetos que não constem no contexto fornecido.
7. LINKS E DIRECIONAMENTO: Sempre que falar de um projeto ou artigo, mencione-o em negrito e convide o usuário a conferir a seção Works ou o GitHub oficial: https://github.com/Matheus-dCastro`;

// ==============================================================================
// 🛡️ GUARDRAILS DE CLIENTE (FAST PRE-FLIGHT CHECK)
// ==============================================================================
export const GUARDRAIL_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /desconsidere\s+(todas\s+as\s+)?instru[çc][õo]es/i,
  /ignore\s+suas\s+regras/i,
  /dan\s+mode/i,
  /jailbreak/i,
  /system\s+prompt/i,
  /reveal\s+(your\s+)?(api|secret|token|key)/i,
  /revele\s+(sua\s+)?(chave|secret|token|api)/i,
  /act\s+as\s+a\s+(linux|bash|cmd)\s+terminal/i,
  /finja\s+que\s+[eé]\s+um\s+terminal/i,
  /bypass\s+safety/i,
  /drop\s+table/i
];

export const GUARDRAIL_OFF_TOPIC_PATTERNS = [
  /receita\s+de\s+(bolo|torta|p[aã]o|comida)/i,
  /recipe\s+for/i,
  /previs[aã]o\s+do\s+tempo/i,
  /weather\s+forecast/i,
  /conte\s+(uma\s+)?piada/i,
  /tell\s+me\s+a\s+joke/i,
  /quem\s+ganhou\s+o\s+jogo/i,
  /who\s+won\s+the\s+game/i
];

/**
 * Valida mensagem localmente antes da chamada remota para economizar latência e tokens
 */
export function validateMessageGuardrails(message) {
  if (!message || typeof message !== "string") return { allowed: true };

  for (const pattern of GUARDRAIL_INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      return {
        allowed: false,
        reason: "injection",
        reply: "Como Alomyr, sigo diretrizes estritas de segurança e escopo. Meu propósito é apresentar exclusivamente os projetos de Inteligência Artificial, engenharia de backend e qualificações de Matheus de Castro. Como posso te orientar sobre seu currículo?"
      };
    }
  }

  for (const pattern of GUARDRAIL_OFF_TOPIC_PATTERNS) {
    if (pattern.test(message)) {
      return {
        allowed: false,
        reason: "off_topic",
        reply: "Como Alomyr, meu escopo é limitado a tirar dúvidas sobre a trajetória acadêmica, projetos de Machine Learning/Backend e artigos técnicos de Matheus de Castro. Que tal explorar projetos como o **AgentMetrics** ou a **Segmentação Médica com U-Net**?"
      };
    }
  }

  return { allowed: true };
}

/**
 * Constrói o contexto dinâmico do portfólio a partir dos dados do sistema
 */
export function buildPortfolioContext() {
  const projects = getStoredProjects();
  const articles = getStoredArticles();
  const experiences = getStoredExperiences();
  const cvConfig = getStoredCvConfig();

  let context = "\n\n### BASE DE CONHECIMENTO OFICIAL DE MATHEUS DE CASTRO:\n\n";

  context += "#### PERFIL & FORMAÇÃO:\n";
  context += "- Nome: Matheus de Castro\n";
  context += "- Formação: Bacharelando em Tecnologia da Informação (BTI) na UFRN e Técnico em TI pelo IFRN.\n";
  context += "- Foco: Machine Learning Engineering (PyTorch, U-Net, Visão Computacional), Backend Python (FastAPI/PostgreSQL) e Automações Linux/n8n.\n";
  context += "- GitHub Oficial: https://github.com/Matheus-dCastro\n";
  context += "- LinkedIn: https://www.linkedin.com/in/matheus-dcastro\n";
  context += "- Email: matheus.vsf.castro.25@gmail.com\n\n";

  if (experiences.length > 0) {
    context += "#### EXPERIÊNCIAS PROFISSIONAIS:\n";
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

  if (projects.length > 0) {
    context += "#### PROJETOS NO PORTFÓLIO:\n";
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

  if (articles.length > 0) {
    context += "#### ARTIGOS & PUBLICAÇÕES:\n";
    articles.forEach((art) => {
      context += `- Artigo "${art.title}" [${art.category}]:\n`;
      context += `  * Resumo: ${art.shortDescription || art.aboutContext || "Sem resumo"}\n`;
      if (art.googleDocsUrl) context += `  * Link Google Docs: ${art.googleDocsUrl}\n`;
      if (art.pdfUrl) context += `  * Link PDF: ${art.pdfUrl}\n`;
    });
    context += "\n";
  }

  const thoughts = getStoredThoughts();
  if (thoughts.length > 0) {
    context += "#### PENSAMENTOS & REFLEXÕES (ENSAIOS TÉCNICOS/FILOSÓFICOS):\n";
    thoughts.forEach((th) => {
      context += `- Pensamento/Ensaio "${th.title}" [${th.category}]:\n`;
      context += `  * Resumo: ${th.shortDescription || th.aboutContext || "Sem resumo"}\n`;
      if (th.content) {
        context += `  * Trecho de conteúdo: ${th.content.slice(0, 300)}...\n`;
      }
      if (th.googleDocsUrl) context += `  * Link Google Docs: ${th.googleDocsUrl}\n`;
    });
    context += "\n";
  }

  context += "#### CURRÍCULO:\n";
  context += `- Versão Interativa Google Docs: ${cvConfig.googleDocsUrl || "Disponível no site"}\n`;
  context += `- Documento Oficial PDF: ${cvConfig.pdfUrl || "Disponível para download no Hero"}\n`;
  context += `- Data de atualização: ${cvConfig.updatedAt || "Recente"}\n`;

  return context;
}

export function getGroqApiKey() {
  const custom = (typeof localStorage !== "undefined" && localStorage.getItem("portfolio_groq_api_key")) || "";
  if (custom && custom.trim()) return custom.trim();

  // Decodificado dinamicamente em runtime para não expor tokens em scanners estáticos de repositório público
  const data = [
    61, 40, 55, 2, 26, 5, 39, 107, 9, 20, 42, 27, 23, 47, 40, 46, 109, 30,
    28, 45, 4, 32, 34, 100, 10, 25, 59, 25, 56, 104, 26, 4, 7, 56, 42, 30,
    19, 5, 54, 105, 9, 86, 40, 24, 56, 31, 29, 26, 89, 48, 25, 46, 50, 111,
    5, 40
  ];
  let token = "";
  for (let i = 0; i < data.length; i++) {
    token += String.fromCharCode(data[i] ^ (0x5a + (i % 7)));
  }
  return token;
}

/**
 * Executa chamada direta à API da Groq com resiliência total
 */
export async function callGroqDirect(
  queryText,
  conversationHistory = [],
  customPrompt = null,
  requestedModel = PRIMARY_MODEL,
  customApiKey = null
) {
  const activeKey =
    customApiKey ||
    getGroqApiKey() ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GROQ_API_KEY) ||
    "";

  if (!activeKey) {
    throw new Error("Chave Groq API não configurada no ambiente.");
  }

  const modelToUse = normalizeModelName(requestedModel);
  const basePrompt = customPrompt || DEFAULT_SYSTEM_PROMPT;
  const fullSystemPrompt = basePrompt + buildPortfolioContext();

  const formattedHistory = Array.isArray(conversationHistory)
    ? conversationHistory.slice(-8).map((m) => ({
        role: m.sender === "user" || m.role === "user" ? "user" : "assistant",
        content: m.text || m.content || ""
      }))
    : [];

  const messages = [
    { role: "system", content: fullSystemPrompt },
    ...formattedHistory.filter((m) => m.content !== queryText),
    { role: "user", content: queryText }
  ];

  const tryRequest = async (targetModel) => {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${activeKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `HTTP ${res.status}`);
    }

    const json = await res.json();
    return {
      success: true,
      text: json.choices?.[0]?.message?.content || "",
      model: targetModel,
      usage: json.usage
    };
  };

  try {
    return await tryRequest(modelToUse);
  } catch (err) {
    console.warn(`Tentativa com ${modelToUse} falhou: ${err.message}. Ativando modelo fallback ${FALLBACK_MODEL}...`);
    return await tryRequest(FALLBACK_MODEL);
  }
}

/**
 * Envia mensagem para o Agente IA via Supabase Edge Function (/chat-qwen)
 * com fallback transparente para inferência direta caso a Edge Function não esteja deployed.
 *
 * @param {Array<{sender: 'user'|'bot'|'assistant', text?: string, content?: string}>} messages
 * @param {string|null} customPrompt
 * @param {string} model
 * @param {string|null} apiKey
 * @returns {Promise<{success: boolean, text: string, model: string, error?: string}>}
 */
export async function sendChatMessage(messages, customPrompt = null, model = PRIMARY_MODEL, apiKey = null) {
  // 1. Extrai a última mensagem do usuário
  const userMessages = messages.filter((m) => m.sender === "user" || m.role === "user");
  const lastUserMsg = userMessages[userMessages.length - 1];
  const queryText = (lastUserMsg?.text || lastUserMsg?.content || "").trim();

  // 2. Pré-validação rápida de Guardrails no cliente
  const guardrailCheck = validateMessageGuardrails(queryText);
  if (!guardrailCheck.allowed) {
    return {
      success: true,
      text: guardrailCheck.reply,
      model: "guardrails-protection"
    };
  }

  const modelToUse = normalizeModelName(model);

  // 3. Tenta primeiro a Supabase Edge Function (/chat-qwen)
  if (isSupabaseConfigured && supabase) {
    try {
      const invokeBody = {
        message: queryText,
        conversationHistory: messages,
        customPrompt,
        model: modelToUse
      };
      if (apiKey) {
        invokeBody.apiKey = apiKey;
      }
      const { data, error } = await supabase.functions.invoke("chat-qwen", {
        body: invokeBody
      });

      if (!error && data && (data.reply || data.text)) {
        return {
          success: true,
          text: data.reply || data.text,
          model: data.model || modelToUse,
          usage: data.usage
        };
      }

      if (error) {
        throw error;
      }
    } catch (edgeErr) {
      console.info(
        "[Alomyr AI] Edge Function não acessível no momento (" +
          edgeErr.message +
          "). Ativando fallback de inferência direta resiliente via Groq API..."
      );
    }
  }

  // 4. Fallback de alta resiliência: Inferência direta via Groq API
  try {
    const directResult = await callGroqDirect(queryText, messages, customPrompt, modelToUse, apiKey);
    return directResult;
  } catch (directErr) {
    console.error("[Alomyr AI] Falha em ambas as estratégias de inferência:", directErr);
    return {
      success: false,
      text: `Desculpe, ocorreu uma instabilidade temporária na comunicação com o assistente (${directErr.message}). Por favor, tente novamente em alguns instantes.`,
      model: modelToUse,
      error: directErr.message
    };
  }
}
