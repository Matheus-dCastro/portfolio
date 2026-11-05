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

  // Check Off-Topic Requests
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(userMessage)) {
      return {
        blocked: true,
        reason: "off_topic",
        reply: "Como Alomyr, meu escopo é limitado a tirar dúvidas sobre a trajetória acadêmica, projetos de Machine Learning/Backend e publicações técnicas de Matheus de Castro. Que tal explorar projetos como o AgentMetrics ou a segmentação médica com U-Net?",
      };
    }
  }

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

      // Monta injeção de conhecimento
      dynamicContext += "\n\n### BASE DE CONHECIMENTO OFICIAL DE MATHEUS DE CASTRO:\n";
      dynamicContext += "- Nome: Matheus de Castro\n";
      dynamicContext += "- Formação: Bacharelando em Tecnologia da Informação (BTI) na UFRN e Técnico em TI pelo IFRN.\n";
      dynamicContext += "- Especialidade: Machine Learning Engineering (PyTorch, Deep Learning, Computer Vision, U-Net) e Backend (Python, FastAPI, PostgreSQL, Docker).\n";
      dynamicContext += "- GitHub: https://github.com/Matheus-dCastro\n";
      dynamicContext += "- LinkedIn: https://www.linkedin.com/in/matheus-dcastro\n";
      dynamicContext += "- Email: matheus.vsf.castro.25@gmail.com\n\n";

      if (works && works.length > 0) {
        dynamicContext += "#### PROJETOS NO PORTFÓLIO:\n";
        works.forEach((w) => {
          dynamicContext += `- Projeto "${w.title}" [${w.category}]: ${w.short_description}. Tags: [${w.tags?.join(", ")}]. GitHub: ${w.github_url || "N/A"}. Demo: ${w.demo_url || "N/A"}\n`;
        });
        dynamicContext += "\n";
      }

      if (articles && articles.length > 0) {
        dynamicContext += "#### ARTIGOS TÉCNICOS & PUBLICAÇÕES:\n";
        articles.forEach((a) => {
          dynamicContext += `- Artigo "${a.title}" [${a.category}]: ${a.short_description}. Docs: ${a.google_docs_url || "N/A"}\n`;
        });
        dynamicContext += "\n";
      }

      if (cvConfig) {
        dynamicContext += "#### CURRÍCULO:\n";
        dynamicContext += `- Versão Google Docs: ${cvConfig.google_docs_url || "Disponível no site"}\n`;
        dynamicContext += `- Documento PDF: ${cvConfig.pdf_url || "Disponível no site"}\n`;
      }
    }

    const defaultPrompt = `Você é o Alomyr, o Assistente Oficial de IA do portfólio de Matheus de Castro.
Responda exclusivamente sobre a carreira, projetos de Machine Learning/Backend, artigos, pensamentos/reflexões e qualificações de Matheus de Castro.
Mantenha um tom técnico, acolhedor e direto. Nunca alucine projetos inexistentes.
Sempre que mencionar projetos, inclua o nome em destaque e convide o visitante a conferir no GitHub ou no portfólio.`;

    const fullSystemPrompt = (systemPromptBase || defaultPrompt) + dynamicContext;

    // Build chat completion messages
    const formattedHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-8).map((m: any) => ({
          role: m.sender === "user" || m.role === "user" ? "user" : "assistant",
          content: m.text || m.content || "",
        }))
      : [];

    const messages = [
      { role: "system", content: fullSystemPrompt },
      ...formattedHistory,
      { role: "user", content: trimmedMsg },
    ];

    // Inference with Groq API
    const groqApiKey = Deno.env.get("GROQ_API_KEY") || Deno.env.get("QWEN_API_KEY") || dbGroqApiKey || body.apiKey;

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

    // Map model names if needed
    let modelToRequest = activeModelName;
    if (
      !activeModelName ||
      activeModelName.includes("qwen") ||
      activeModelName === "Qwen 2.5 Coder 32B-Instruct" ||
      activeModelName === "qwen-2.5-coder-32b"
    ) {
      modelToRequest = "qwen/qwen3.8-27b";
    } else if (activeModelName.includes("120b")) {
      modelToRequest = "openai/gpt-oss-120b";
    } else if (activeModelName.includes("20b") || activeModelName.includes("llama")) {
      modelToRequest = "openai/gpt-oss-20b";
    }

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
        max_tokens: activeMaxTokens,
      }),
    });

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erro da API da Groq: ${groqResponse.status}`);
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
