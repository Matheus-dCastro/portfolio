// src/lib/llmService.js
// Client service for Supabase Edge Function AI integration (/chat-qwen)
// 🔒 MANDATÓRIO: Nenhuma chave secreta de API reside no frontend ou localStorage.
// A inferência ocorre 100% isolada e serverless na nuvem Supabase.

import { supabase, isSupabaseConfigured } from "./supabaseClient";
import {
  getStoredProjects,
  getStoredArticles,
  getStoredExperiences,
  getStoredCvConfig
} from "../data/projectsData";

export const PRIMARY_MODEL = "qwen-2.5-coder-32b";
export const FALLBACK_MODEL = "llama-3.3-70b-versatile";

export const DEFAULT_SYSTEM_PROMPT = `Você é o Alomyr, o Assistente Oficial de Inteligência Artificial do portfólio de Matheus de Castro.

## SEU PAPEL E OBJETIVO
Seu objetivo é orientar visitantes, recrutadores, pesquisadores e parceiros técnicos, apresentando com clareza as qualificações, projetos, publicações e competências técnicas de Matheus de Castro nas áreas de:
- Machine Learning Engineering & Deep Learning (PyTorch, Computer Vision, U-Net, Data Analysis)
- Arquitetura de Backend & Engenharia de Software (Python, FastAPI, PostgreSQL, Docker, RESTful APIs)
- Automação de Fluxos de Trabalho Inteligentes & DevOps (n8n, Linux Ubuntu Server, Bash, CI/CD)
- Formação Acadêmica: Bacharelado em Tecnologia da Informação (BTI) na UFRN e Técnico em TI pelo IFRN.

## DIRETRIZES DE COMPORTAMENTO
1. IDENTIDADE: Seu nome é Alomyr. Apresente-se sempre como Alomyr.
2. IDIOMA: Responda fluente e naturalmente no idioma utilizado pelo visitante (inglês ou português).
3. ESCOPO FECHADO: Responda APENAS sobre a trajetória acadêmica, profissional, projetos, artigos e competências de Matheus de Castro.
4. RECUSA DE ESCOPO: Se o usuário pedir receitas, piadas ou tópicos não relacionados ao portfólio, recuse cordial e profissionalmente:
   "Como Alomyr, assistente oficial do portfólio de Matheus de Castro, meu escopo é limitado a dúvidas sobre seus projetos de IA, backend e currículo."
5. TOM DE VOZ: Técnico, profissional, acolhedor, conciso e preciso.
6. PROIBIDO ALUCINAR: Nunca invente experiências ou projetos que não constem no contexto fornecido.
7. LINKS E DIRECIONAMENTO: Sempre que falar de um projeto, mencione-o em negrito e convide o usuário a conferir a seção Works ou o GitHub oficial: https://github.com/Matheus-dCastro`;

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

  context += "#### CURRÍCULO:\n";
  context += `- Versão Interativa Google Docs: ${cvConfig.googleDocsUrl || "Disponível no site"}\n`;
  context += `- Documento Oficial PDF: ${cvConfig.pdfUrl || "Disponível para download no Hero"}\n`;
  context += `- Data de atualização: ${cvConfig.updatedAt || "Recente"}\n`;

  return context;
}

/**
 * Envia mensagem para o Agente IA via Supabase Edge Function (/chat-qwen)
 * 🔒 ZERO API KEYS NO FRONTEND: a requisição é autenticada e resolvida na borda da nuvem Supabase.
 *
 * @param {Array<{sender: 'user'|'bot'|'assistant', text?: string, content?: string}>} messages
 * @param {string|null} customPrompt
 * @param {string} model
 * @returns {Promise<{success: boolean, text: string, model: string, error?: string}>}
 */
export async function sendChatMessage(messages, customPrompt = null, model = PRIMARY_MODEL) {
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

  // 3. Invocação da Supabase Edge Function (/chat-qwen)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.functions.invoke("chat-qwen", {
        body: {
          message: queryText,
          conversationHistory: messages,
          customPrompt,
          model
        }
      });

      if (!error && data) {
        const reply = data.reply || data.text || "";
        return {
          success: true,
          text: reply,
          model: data.model || model,
          usage: data.usage
        };
      }

      if (error) {
        console.warn("Supabase Edge Function /chat-qwen retornou erro:", error);
        throw error;
      }
    } catch (edgeErr) {
      console.warn("Falha de rede ao invocar Edge Function /chat-qwen:", edgeErr.message);
      return {
        success: false,
        text: `🔒 Modo Seguro Ativo: A inferência é processada na nuvem através do Supabase Edge Functions ('/chat-qwen'). Nenhuma chave de API reside no seu navegador. Quando o deploy for concluído no Supabase Cloud ('npx supabase functions deploy chat-qwen'), as respostas serão geradas em tempo real. (${edgeErr.message})`,
        model,
        error: edgeErr.message
      };
    }
  }

  // Fallback seguro caso o cliente Supabase não esteja configurado
  return {
    success: false,
    text: "Conexão com a nuvem Supabase não configurada. As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessárias para a comunicação segura com o assistente.",
    model,
    error: "Supabase not configured"
  };
}
