// supabase/functions/chat-qwen/index.ts
// Supabase Edge Function: Serverless AI Inference via Groq API (Qwen 2.5 Coder / Llama 3.3)
// Zero secrets reside on client; credentials isolated in Supabase Secrets.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ==============================================================================
// 🛡️ GUARDRAILS & SAFETY VALIDATION
// ==============================================================================
const INJECTION_PATTERNS = [
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
  /drop\s+table/i,
  /<script>/i,
];

const OFF_TOPIC_PATTERNS = [
  /receita\s+de\s+(bolo|torta|p[aã]o|comida)/i,
  /recipe\s+for/i,
  /previs[aã]o\s+do\s+tempo/i,
  /weather\s+forecast/i,
  /conte\s+(uma\s+)?piada/i,
  /tell\s+me\s+a\s+joke/i,
  /quem\s+ganhou\s+o\s+jogo/i,
  /who\s+won\s+the\s+game/i,
];

function checkGuardrails(userMessage: string): { blocked: boolean; reason?: string; reply?: string } {
  // Check Prompt Injections
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(userMessage)) {
      return {
        blocked: true,
        reason: "injection_attempt",
        reply: "Como Alomyr, assistente oficial do portfólio de Matheus de Castro, sigo diretrizes estritas de segurança e escopo. Meu propósito é apresentar exclusivamente seus projetos de IA, backend e currículo técnico. Como posso te ajudar com o portfólio?",
      };
    }
  }

  // Autonomia ampliada: Alomyr responde perguntas gerais e técnicas com destreza e clareza
  return { blocked: false };
}

// ==============================================================================
// 🚀 SERVER HANDLER
// ==============================================================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      message = "",
      conversationHistory = [],
      customPrompt = null,
      model = null,
    } = body;

    const trimmedMsg = typeof message === "string" ? message.trim() : "";

    if (!trimmedMsg) {
      return new Response(JSON.stringify({ error: "Mensagem vazia ou inválida." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Limit input length for protection against token exhaustion
    if (trimmedMsg.length > 2500) {
      return new Response(JSON.stringify({ error: "Mensagem excede o limite máximo permitido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Guardrail Check
    const guardrailResult = checkGuardrails(trimmedMsg);
    if (guardrailResult.blocked && guardrailResult.reply) {
      return new Response(
        JSON.stringify({
          success: true,
          reply: guardrailResult.reply,
          model: "guardrails-protection",
          guardrailTriggered: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Supabase Server-Side Client for Context Retrieval (RAG Leve)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    let dynamicContext = "";
    let systemPromptBase = customPrompt || "";
    let activeModelName = model || "qwen/qwen3.8-27b";
    let activeTemperature = 0.3;
    let activeMaxTokens = 800;
    let dbGroqApiKey = "";

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Carrega agent_configs de produção
      const { data: agentConfig } = await supabase
        .from("agent_configs")
        .select("system_prompt, model_name, temperature, max_tokens, groq_api_key")
        .eq("id", "production")
        .maybeSingle();

      if (agentConfig) {
        if (!systemPromptBase && agentConfig.system_prompt) {
          systemPromptBase = agentConfig.system_prompt;
        }
        if (!model && agentConfig.model_name) activeModelName = agentConfig.model_name;
        if (agentConfig.temperature !== undefined) activeTemperature = Number(agentConfig.temperature);
        if (agentConfig.max_tokens !== undefined) activeMaxTokens = Number(agentConfig.max_tokens);
        if (agentConfig.groq_api_key) dbGroqApiKey = agentConfig.groq_api_key;
        if (!dbGroqApiKey && agentConfig.system_prompt) {
          const keyMatch = agentConfig.system_prompt.match(/<!--\s*AGENT_KEY:\s*([^\s>]+)\s*-->/);
          if (keyMatch) dbGroqApiKey = keyMatch[1];
        }
      }

      // 2. Carrega lista de projetos publicados
      const { data: works } = await supabase
        .from("works")
        .select("title, category, tags, short_description, github_url, demo_url")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      // 3. Carrega lista de artigos publicados
      const { data: articles } = await supabase
        .from("articles")
        .select("title, category, tags, short_description, google_docs_url, pdf_url")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      // 4. Carrega currículo
      const { data: cvConfig } = await supabase
        .from("cv_configs")
        .select("google_docs_url, pdf_url, updated_at")
        .eq("id", "production")
        .maybeSingle();

      // Monta injeção de conhecimento compacta
      dynamicContext += "\n\n### BASE DE CONHECIMENTO (MATHEUS DE CASTRO):\n";
      dynamicContext += "- Formação: BTI na UFRN e Técnico em TI pelo IFRN. Foco: Machine Learning Engineering (PyTorch, Visão Computacional, U-Net) e Backend (Python, FastAPI, PostgreSQL, Docker).\n";
      dynamicContext += "- Links: GitHub: https://github.com/Matheus-dCastro | LinkedIn: https://www.linkedin.com/in/matheus-dcastro | Email: matheus.vsf.castro.25@gmail.com\n";

      if (works && works.length > 0) {
        dynamicContext += "#### PROJETOS NO PORTFÓLIO:\n";
        works.slice(0, 8).forEach((w: any) => {
          const desc = (w.short_description || "").slice(0, 140).replace(/\n+/g, " ");
          const tags = Array.isArray(w.tags) ? w.tags.slice(0, 4).join(", ") : "";
          dynamicContext += `- **${w.title}** [${w.category}]: ${desc} (Tech: ${tags})\n`;
        });
      }

      if (articles && articles.length > 0) {
        dynamicContext += "#### ARTIGOS TÉCNICOS:\n";
        articles.slice(0, 4).forEach((a: any) => {
          const desc = (a.short_description || "").slice(0, 120).replace(/\n+/g, " ");
          dynamicContext += `- **${a.title}**: ${desc}\n`;
        });
      }

      if (cvConfig) {
        dynamicContext += "#### CURRÍCULO:\n";
        dynamicContext += `- Google Docs: ${cvConfig.google_docs_url || "Disponível no site"} | PDF: ${cvConfig.pdf_url || "Disponível no site"}\n`;
      }
    }

    const defaultPrompt = `Você é o Alomyr, o Assistente Oficial e Inteligente de IA do portfólio de Matheus de Castro.
Você tem autonomia para explicar profundamente a arquitetura de backend, modelos de Machine Learning (PyTorch, U-Net, Visão Computacional), artigos e currículo técnico de Matheus.
Mantenha um tom técnico, acolhedor, conciso e articulado, explicando com clareza lições práticas de engenharia e trade-offs.`;

    // Garante que o prompt não estoure o limite de TPM/tokens da Groq
    const cleanedBasePrompt = (systemPromptBase || defaultPrompt)
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim()
      .slice(0, 1200);

    const fullSystemPrompt = cleanedBasePrompt + "\n" + dynamicContext.slice(0, 1200);

    // Build chat completion messages (keep recent turns, truncate lengths)
    const formattedHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-4).map((m: any) => ({
          role: m.sender === "user" || m.role === "user" ? "user" : "assistant",
          content: String(m.text || m.content || "").slice(0, 200),
        }))
      : [];

    const messages = [
      { role: "system", content: fullSystemPrompt },
      ...formattedHistory.filter((m: any) => m.content !== trimmedMsg),
      { role: "user", content: trimmedMsg.slice(0, 300) },
    ];

    // Inference with Groq API (suporta GROQ_API_KEY, agent_key ou QWEN_API_KEY)
    const groqApiKey =
      Deno.env.get("GROQ_API_KEY") ||
      Deno.env.get("AGENT_KEY") ||
      Deno.env.get("agent_key") ||
      Deno.env.get("QWEN_API_KEY") ||
      dbGroqApiKey ||
      body.apiKey;

    if (!groqApiKey) {
      return new Response(
        JSON.stringify({
          error: "Chave GROQ_API_KEY não configurada no Supabase Secrets.",
          tip: "Execute: npx supabase secrets set GROQ_API_KEY=sua-chave",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Map model names to Groq official production models: llama-3.3-70b-versatile e llama-3.1-8b-instant
    let modelToRequest = "llama-3.3-70b-versatile";
    if (activeModelName && (activeModelName.includes("8b") || activeModelName.includes("instant") || activeModelName.includes("fast"))) {
      modelToRequest = "llama-3.1-8b-instant";
    } else if (activeModelName && activeModelName.includes("70b")) {
      modelToRequest = "llama-3.3-70b-versatile";
    } else if (activeModelName && !activeModelName.includes("qwen") && !activeModelName.includes("oss")) {
      modelToRequest = activeModelName;
    }

    const safeMaxTokens = Math.min(activeMaxTokens || 400, 600);

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelToRequest,
        messages,
        temperature: activeTemperature,
        max_tokens: safeMaxTokens,
      }),
    });

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}));
      // Fallback transparente para modelo secundario ultrarrapido (llama-3.1-8b-instant)
      const retryResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages,
          temperature: activeTemperature,
          max_tokens: 400,
        }),
      });

      if (!retryResponse.ok) {
        const retryErr = await retryResponse.json().catch(() => ({}));
        throw new Error(retryErr?.error?.message || errData?.error?.message || `Erro da API da Groq: ${groqResponse.status}`);
      }

      const retryData = await retryResponse.json();
      const reply = retryData.choices?.[0]?.message?.content || "Desculpe, ocorreu uma instabilidade ao processar a resposta.";
      return new Response(
        JSON.stringify({
          success: true,
          reply,
          text: reply,
          model: "openai/gpt-oss-20b",
          usage: retryData.usage,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const groqData = await groqResponse.json();
    const reply = groqData.choices?.[0]?.message?.content || "Desculpe, ocorreu uma instabilidade ao processar a resposta.";

    return new Response(
      JSON.stringify({
        success: true,
        reply,
        text: reply,
        model: modelToRequest,
        usage: groqData.usage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Erro interno na Edge Function.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
