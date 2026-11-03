// scripts/seed.js
// Script CLI para popular o banco de dados Supabase com todos os projetos, artigos,
// pensamentos, configurações e experiências de Matheus de Castro.

import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_PROJECTS,
  DEFAULT_ARTICLES,
  DEFAULT_THOUGHTS,
  DEFAULT_EXPERIENCES,
  DEFAULT_CV_CONFIG
} from "../src/data/projectsData.js";
import {
  mapProjectToDbWork,
  mapArticleToDb,
  mapThoughtToDb,
  mapExperienceToDb
} from "../src/lib/supabaseService.js";

// Carregar variáveis do .env
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (fs.existsSync(".env")) {
  const envContent = fs.readFileSync(".env", "utf8");
  const matchUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/);
  const matchKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
  if (matchUrl) supabaseUrl = matchUrl[1].trim();
  if (matchKey) supabaseKey = matchKey[1].trim();
}

const args = process.argv.slice(2);
let serviceKey = "";
let adminEmail = "";
let adminPassword = "";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--service-key" && args[i + 1]) {
    serviceKey = args[i + 1];
  }
  if (args[i] === "--login" && args[i + 1] && args[i + 2]) {
    adminEmail = args[i + 1];
    adminPassword = args[i + 2];
  }
}

async function runSeed() {
  console.log("🌱 Iniciando o Seed do Supabase pelo CLI...\n");
  console.log(`📡 URL do Supabase: ${supabaseUrl}`);

  const activeKey = serviceKey || supabaseKey;
  const client = createClient(supabaseUrl, activeKey, {
    auth: { persistSession: false }
  });

  if (adminEmail && adminPassword) {
    console.log(`🔐 Autenticando como ${adminEmail}...`);
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    if (authError) {
      console.error(`❌ Erro na autenticação: ${authError.message}`);
      process.exit(1);
    }
    console.log(`✅ Autenticado com sucesso! ID: ${authData.user.id}\n`);
  }

  // 1. Inserir Artigos
  console.log("📑 Inserindo Artigos Técnicos...");
  for (const art of DEFAULT_ARTICLES) {
    const payload = mapArticleToDb(art);
    const { error } = await client.from("articles").upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn(`  ⚠️ Artigo '${art.title}': ${error.message}`);
    } else {
      console.log(`  ✅ Artigo '${art.title}' inserido.`);
    }
  }

  // 2. Inserir Projetos (Works)
  console.log("\n💻 Inserindo Projetos (Works)...");
  for (const proj of DEFAULT_PROJECTS) {
    const payload = mapProjectToDbWork(proj);
    const { error } = await client.from("works").upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn(`  ⚠️ Projeto '${proj.title}': ${error.message}`);
    } else {
      console.log(`  ✅ Projeto '${proj.title}' inserido.`);
    }
  }

  // 3. Inserir Pensamentos
  console.log("\n💭 Inserindo Pensamentos...");
  for (const th of DEFAULT_THOUGHTS) {
    const payload = mapThoughtToDb(th);
    const { error } = await client.from("thoughts").upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn(`  ⚠️ Pensamento '${th.title}': ${error.message}`);
    } else {
      console.log(`  ✅ Pensamento '${th.title}' inserido.`);
    }
  }

  // 4. Inserir Experiências
  console.log("\n💼 Inserindo Experiências Profissionais...");
  for (const exp of DEFAULT_EXPERIENCES) {
    const payload = mapExperienceToDb(exp);
    const { error } = await client.from("experiences").upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn(`  ⚠️ Experiência '${exp.company} - ${exp.title}': ${error.message}`);
    } else {
      console.log(`  ✅ Experiência '${exp.company}' inserida.`);
    }
  }

  // 5. Inserir CV Config
  console.log("\n📄 Inserindo Configurações de Currículo (CV)...");
  const { error: cvError } = await client.from("cv_configs").upsert({
    id: "production",
    google_docs_url: DEFAULT_CV_CONFIG.googleDocsUrl,
    pdf_url: DEFAULT_CV_CONFIG.pdfUrl,
    updated_at: new Date().toISOString()
  }, { onConflict: "id" });
  if (cvError) {
    console.warn(`  ⚠️ CV Config: ${cvError.message}`);
  } else {
    console.log("  ✅ CV Config sincronizado.");
  }

  // 6. Inserir Agente Config
  console.log("\n🤖 Inserindo Configurações do Agente de IA...");
  const { error: agentError } = await client.from("agent_configs").upsert({
    id: "production",
    model_name: "Qwen 2.5 Coder 32B-Instruct",
    system_prompt: "Você é o assistente oficial do portfólio de Matheus de Castro.",
    updated_at: new Date().toISOString()
  }, { onConflict: "id" });
  if (agentError) {
    console.warn(`  ⚠️ Agent Config: ${agentError.message}`);
  } else {
    console.log("  ✅ Agent Config sincronizado.");
  }

  console.log("\n🎉 Seed finalizado!");
}

runSeed().catch((err) => {
  console.error("Erro fatal no seed:", err);
  process.exit(1);
});
