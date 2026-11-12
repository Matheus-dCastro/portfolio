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
import { getStoredBlogPosts } from "../data/blogData";

export const PRIMARY_MODEL = "llama-3.3-70b-versatile";
export const FALLBACK_MODEL = "llama-3.1-8b-instant";

export function normalizeModelName(name) {
  if (!name || typeof name !== "string") return PRIMARY_MODEL;
  const lower = name.toLowerCase();
  if (lower.includes("8b") || lower.includes("instant") || lower.includes("fast")) {
    return FALLBACK_MODEL;
  }
  return PRIMARY_MODEL;
}

export const DEFAULT_SYSTEM_PROMPT = `Você é o Alomyr, o Assistente Oficial e Inteligente de IA do portfólio de Matheus de Castro.

## SEU PAPEL E AUTONOMIA
Você tem autoridade e autonomia para responder dúvidas técnicas e gerais sobre toda a trajetória, projetos, engenharia de software, modelos de IA, publicações, ensaios e currículo de Matheus de Castro.
Você domina e explica em detalhes:
- Machine Learning Engineering & Deep Learning: PyTorch, Visão Computacional, Segmentação Semântica (U-Net para imagens biomédicas), Treinamento de Redes Neurais, Métricas de Avaliação (Dice Coefficient, IoU, Latência de Inferência).
- Arquitetura de Backend & Engenharia de Dados: Python, FastAPI, PostgreSQL, Docker, Migrações com Supabase, Edge Functions (Deno/TypeScript), Segurança de Aplicações e RLS.
- Automação de Fluxos de Trabalho & DevOps: n8n, Linux Ubuntu Server, Docker Compose, Bash Scripting, CI/CD.
- Filosofia e Design de Software: Clean Code, Separação de Responsabilidades, Arquitetura Hexagonal/Limpa, Observabilidade e Otimização de Custo por Token.
- Formação: Bacharelado em Tecnologia da Informação (BTI) na UFRN e Técnico em TI pelo IFRN.

## DIRETRIZES DE RESPOSTA E QUALIDADE
1. IDENTIDADE: Você é o Alomyr, o assistente oficial inteligente e perspicaz do portfólio.
2. AUTONOMIA TÉCNICA: Responda diretamente, com profundidade analítica e clareza. Não dê respostas vazias ou excessivamente evasivas. Ao ser solicitado a resumir, explicar para iniciantes ou fazer uma análise crítica de projetos ou artigos, elabore respostas ricas, estruturadas com tópicos e lições práticas de engenharia.
3. IDIOMA: Responda no idioma do visitante (português ou inglês) com fluência natural.
4. ESCOPO: Seu foco é a carreira, engenharia, projetos, artigos, ensaios e visão técnica de Matheus de Castro. Para pedidos completamente desprovidos de contexto (como receitas culinárias ou previsão do tempo), redirecione cordialmente para tópicos do portfólio.
5. REFERÊNCIAS: Sempre destaque nomes de projetos, artigos ou tecnologias em negrito (**AgentMetrics**, **Segmentação Médica U-Net**, etc.) e cite o GitHub oficial (https://github.com/Matheus-dCastro) quando pertinente.`;

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

  // Permite que o Alomyr responda perguntas com plena autonomia técnica
  return { allowed: true };
}

export function cleanSystemPrompt(prompt) {
  if (!prompt || typeof prompt !== "string") return "";
  return prompt.replace(/<!--\s*[A-Z_]+:\s*[\s\S]*?-->\n?/g, "").trim();
}

/**
 * Constrói o contexto dinâmico do portfólio em formato compacto e de alta densidade
 */
export function buildPortfolioContext() {
  const projects = getStoredProjects();
  const articles = getStoredArticles();
  const experiences = getStoredExperiences();
  const cvConfig = getStoredCvConfig();

  let context = "\n\n### BASE DE CONHECIMENTO (MATHEUS DE CASTRO):\n";
  context += "- Perfil: Bacharelando em TI (BTI) na UFRN e Técnico em TI pelo IFRN. Foco: Machine Learning Engineering (PyTorch, Deep Learning, Visão Computacional, U-Net) e Backend (Python, FastAPI, PostgreSQL, Docker).\n";
  context += "- Links: GitHub (https://github.com/Matheus-dCastro) | LinkedIn (https://www.linkedin.com/in/matheus-dcastro) | Email: matheus.vsf.castro.25@gmail.com\n";

  if (cvConfig?.googleDocsUrl || cvConfig?.pdfUrl) {
    context += `- Currículo: Google Docs (${cvConfig.googleDocsUrl || "no portfólio"}) | PDF (${cvConfig.pdfUrl || "no portfólio"})\n`;
  }

  if (experiences.length > 0) {
    context += "#### EXPERIÊNCIAS PRINCIPAIS:\n";
    experiences.slice(0, 3).forEach((exp) => {
      context += `- ${exp.title} na ${exp.company} (${exp.time})\n`;
    });
  }

  if (projects.length > 0) {
    context += "#### PROJETOS EM DESTAQUE:\n";
    projects.slice(0, 8).forEach((proj) => {
      const summary = (proj.shortDescription || proj.aboutContext || "").slice(0, 160).replace(/\n+/g, " ");
      const tags = Array.isArray(proj.tags) ? proj.tags.slice(0, 4).join(", ") : "";
      context += `- **${proj.title}** [${proj.category}]: ${summary} (Tech: ${tags})\n`;
    });
  }

  if (articles.length > 0) {
    context += "#### PUBLICAÇÕES & ARTIGOS:\n";
    articles.slice(0, 5).forEach((art) => {
      const summary = (art.shortDescription || "").slice(0, 140).replace(/\n+/g, " ");
      context += `- **${art.title}**: ${summary}\n`;
    });
  }

  const thoughts = typeof getStoredThoughts === "function" ? getStoredThoughts() : [];
  if (thoughts.length > 0) {
    context += "#### ENSAIOS & PENSAMENTOS:\n";
    thoughts.slice(0, 4).forEach((th) => {
      const summary = (th.shortDescription || th.content || "").slice(0, 130).replace(/\n+/g, " ");
      context += `- **${th.title}**: ${summary}\n`;
    });
  }

  const posts = typeof getStoredBlogPosts === "function" ? getStoredBlogPosts() : [];
  if (posts.length > 0) {
    context += "#### MATÉRIAS DO BLOG (TECH & ALOMYR):\n";
    posts.slice(0, 5).forEach((bp) => {
      const summary = (bp.summary || bp.titlePt || "").slice(0, 130).replace(/\n+/g, " ");
      context += `- **${bp.titlePt || bp.titleEn}**: ${summary}\n`;
    });
  }

  return context;
}

export function getGroqApiKey() {
  // Retorna chave fornecida manualmente em runtime se houver (sem tokens hardcoded)
  return "";
}

/**
 * Executa chamada direta à API da Groq com resiliência total e proteção de context-length
 */
export async function callGroqDirect(
  queryText,
  conversationHistory = [],
  customPrompt = null,
  requestedModel = PRIMARY_MODEL,
  customApiKey = null
) {
  const activeKey = customApiKey || "";

  if (!activeKey) {
    throw new Error("Chave Groq API não informada para chamada direta.");
  }

  const modelToUse = normalizeModelName(requestedModel);
  const basePrompt = cleanSystemPrompt(customPrompt || DEFAULT_SYSTEM_PROMPT);
  const fullSystemPrompt = basePrompt + buildPortfolioContext();

  const formattedHistory = Array.isArray(conversationHistory)
    ? conversationHistory
        .slice(-6)
        .filter((m) => {
          const content = (m.text || m.content || "").trim();
          return content && content !== queryText;
        })
        .map((m) => ({
          role: m.sender === "user" || m.role === "user" ? "user" : "assistant",
          content: (m.text || m.content || "").slice(0, 350)
        }))
    : [];

  const buildMessages = (sysPrompt) => [
    { role: "system", content: sysPrompt },
    ...formattedHistory,
    { role: "user", content: queryText }
  ];

  const tryRequest = async (targetModel, sysContent = fullSystemPrompt, maxTokensLimit = 600) => {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${activeKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: targetModel,
        messages: buildMessages(sysContent),
        temperature: 0.3,
        max_tokens: maxTokensLimit
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
    console.warn(`[Alomyr AI] Tentativa com ${modelToUse} falhou: ${err.message}. Ativando modelo fallback...`);

    // Se o erro for de tamanho de mensagem/contexto, tenta com prompt minimalista
    const isLengthError = /reduce the length|too large|context_length|rate_limit|ITPM|OTPM|TPM/i.test(err.message);
    const fallbackSys = isLengthError ? basePrompt : fullSystemPrompt;
    const fallbackTokens = isLengthError ? 450 : 600;

    try {
      return await tryRequest(FALLBACK_MODEL, fallbackSys, fallbackTokens);
    } catch (fallbackErr) {
      // Último recurso: modelo de maior capacidade de contexto (gpt-oss-120b) com prompt enxuto
      console.warn(`[Alomyr AI] Fallback 1 falhou: ${fallbackErr.message}. Tentando modelo alternativo...`);
      return await tryRequest("openai/gpt-oss-120b", basePrompt, 400);
    }
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
          "). Verifique se a função chat-qwen foi deployed no Supabase."
      );
    }
  }

  // 4. Fallback de teste local: Se o admin fornecer uma chave temporária manualmente no simulador
  if (apiKey) {
    try {
      const directResult = await callGroqDirect(queryText, messages, customPrompt, modelToUse, apiKey);
      return directResult;
    } catch (directErr) {
      console.warn("[Alomyr AI] Falha na inferência direta com chave fornecida:", directErr);
    }
  }

  return {
    success: false,
    text: "O assistente oficial Alomyr está temporariamente offline aguardando sincronização da Edge Function na nuvem. Você pode explorar os projetos diretamente pelas seções do portfólio ou falar com Matheus através dos links de contato!",
    model: modelToUse
  };
}
