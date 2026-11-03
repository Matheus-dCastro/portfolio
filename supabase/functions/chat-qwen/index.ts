import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Mensagem inválida." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Inicializa Supabase Client para carregar contexto
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Carrega o System Prompt mais recente
    const { data: agentConfig } = await supabase
      .from("agent_configs")
      .select("system_prompt, model_name")
      .eq("id", "production")
      .maybeSingle();

    // 2. Carrega lista de projetos publicados para o contexto (RAG Leve)
    const { data: works } = await supabase
      .from("works")
      .select("title, category, tags, short_description, github_url, demo_url")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    // Monta o contexto injetado
    let portfolioContext = "\n\n## 📚 PROJETOS DISPONÍVEIS NO PORTFÓLIO:\n";
    works?.forEach((w) => {
      portfolioContext += `- **${w.title}** (${w.category}): ${w.short_description}. Tags: [${w.tags.join(", ")}]. GitHub: ${w.github_url || "N/A"}\n`;
    });

    const fullSystemPrompt = (agentConfig?.system_prompt || "Você é o assistente do portfólio de Matheus.") + portfolioContext;

    // 3. Monta mensagens para o Qwen
    const messages = [
      { role: "system", content: fullSystemPrompt },
      ...conversationHistory.slice(-6),
      { role: "user", content: message },
    ];

    // 4. Chamada à API do Qwen (exemplo OpenRouter / Inference Provider)
    const qwenApiKey = Deno.env.get("QWEN_API_KEY")!;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${qwenApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-coder-32b-instruct",
        messages,
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Desculpe, ocorreu uma instabilidade ao processar sua pergunta.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
