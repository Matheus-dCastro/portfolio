// src/lib/supabaseService.js
// Camada unificada de dados: Supabase Cloud + LocalStorage Fallback transparente

import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import {
  getStoredProjects,
  saveProjects,
  getStoredArticles,
  saveArticles,
  getStoredThoughts,
  saveThoughts,
  getStoredExperiences,
  saveExperiences,
  getStoredCvConfig,
  saveCvConfig
} from "../data/projectsData.js";

// ==========================================
// CONTROLE DE ACESSO DO ADMINISTRADOR (WHITELIST)
// ==========================================
export const ALLOWED_ADMINS = [
  "matheus.vsf.castro.25@gmail.com",
  "matheus-dcastro"
];

export function isAuthorizedAdmin(user) {
  if (!user) return false;
  const email = (user.email || "").toLowerCase();
  const githubUser = (
    user.user_metadata?.user_name ||
    user.user_metadata?.preferred_username ||
    ""
  ).toLowerCase();

  return (
    ALLOWED_ADMINS.some((a) => a.toLowerCase() === email) ||
    (githubUser && ALLOWED_ADMINS.some((a) => a.toLowerCase() === githubUser))
  );
}

// ==========================================
// MAPPERS: Banco (snake_case) <-> Frontend (camelCase)
// ==========================================

export function mapDbWorkToProject(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    shortDescription: row.short_description || "",
    aboutContext: row.about_context || "",
    github: row.github_url || "",
    demo: row.demo_url || "",
    contentType: row.content_type || "markdown",
    googleDocsUrl: row.google_docs_url || "",
    pdfUrl: row.pdf_url || "",
    content: row.content || "",
    relatedArticleId: row.related_article_id || "",
    displayOrder: row.display_order ?? 0,
    isPublished: row.is_published ?? true,
    updatedAt: row.updated_at ? row.updated_at.split("T")[0] : ""
  };
}

export function mapProjectToDbWork(item) {
  return {
    id: item.id,
    title: item.title,
    category: item.category || "Profissional",
    tags: Array.isArray(item.tags)
      ? item.tags
      : typeof item.tags === "string"
        ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    short_description: item.shortDescription || "",
    about_context: item.aboutContext || "",
    github_url: item.github || "",
    demo_url: item.demo || "",
    content_type: item.contentType || "markdown",
    google_docs_url: item.googleDocsUrl || "",
    pdf_url: item.pdfUrl || "",
    content: item.content || "",
    related_article_id: item.relatedArticleId ? item.relatedArticleId : null,
    display_order: item.displayOrder ?? 0,
    is_published: item.isPublished !== false
  };
}

export function mapDbArticle(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category || "Acadêmico",
    tags: Array.isArray(row.tags) ? row.tags : [],
    shortDescription: row.short_description || "",
    aboutContext: row.about_context || "",
    contentType: row.content_type || "markdown",
    googleDocsUrl: row.google_docs_url || "",
    pdfUrl: row.pdf_url || "",
    content: row.content || "",
    relatedProjectId: row.related_work_id || "",
    displayOrder: row.display_order ?? 0,
    isPublished: row.is_published ?? true,
    updatedAt: row.updated_at ? row.updated_at.split("T")[0] : ""
  };
}

export function mapArticleToDb(item) {
  return {
    id: item.id,
    title: item.title,
    category: item.category || "Acadêmico",
    tags: Array.isArray(item.tags)
      ? item.tags
      : typeof item.tags === "string"
        ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    short_description: item.shortDescription || "",
    about_context: item.aboutContext || "",
    content_type: item.contentType || "markdown",
    google_docs_url: item.googleDocsUrl || "",
    pdf_url: item.pdfUrl || "",
    content: item.content || "",
    related_work_id: item.relatedProjectId ? item.relatedProjectId : null,
    display_order: item.displayOrder ?? 0,
    is_published: item.isPublished !== false
  };
}

export function mapDbThought(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category || "Pessoal",
    tags: Array.isArray(row.tags) ? row.tags : [],
    shortDescription: row.short_description || "",
    aboutContext: row.about_context || "",
    contentType: row.content_type || "markdown",
    googleDocsUrl: row.google_docs_url || "",
    pdfUrl: row.pdf_url || "",
    content: row.content || "",
    displayOrder: row.display_order ?? 0,
    isPublished: row.is_published ?? true,
    updatedAt: row.updated_at ? row.updated_at.split("T")[0] : ""
  };
}

export function mapThoughtToDb(item) {
  return {
    id: item.id,
    title: item.title,
    category: item.category || "Pessoal",
    tags: Array.isArray(item.tags)
      ? item.tags
      : typeof item.tags === "string"
        ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    short_description: item.shortDescription || "",
    about_context: item.aboutContext || "",
    content_type: item.contentType || "markdown",
    google_docs_url: item.googleDocsUrl || "",
    pdf_url: item.pdfUrl || "",
    content: item.content || "",
    display_order: item.displayOrder ?? 0,
    is_published: item.isPublished !== false
  };
}

export function mapDbExperience(row) {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    time: row.time,
    bullets: Array.isArray(row.bullets) ? row.bullets : [],
    displayOrder: row.display_order ?? 0,
    isPublished: row.is_published ?? true,
    updatedAt: row.updated_at ? row.updated_at.split("T")[0] : ""
  };
}

export function mapExperienceToDb(item) {
  return {
    id: item.id,
    title: item.title,
    company: item.company,
    time: item.time,
    bullets: Array.isArray(item.bullets)
      ? item.bullets
      : typeof item.bullets === "string"
        ? item.bullets.split("\n").map((b) => b.trim()).filter(Boolean)
        : [],
    display_order: item.displayOrder ?? 0,
    is_published: item.isPublished !== false
  };
}

// ==========================================
// OPERAÇÕES DE LEITURA (FETCH)
// ==========================================

export async function fetchWorks(includeDrafts = false) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("works")
        .select("*")
        .order("display_order", { ascending: true });

      if (!includeDrafts) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapDbWorkToProject);
        saveProjects(mapped); // Mantém cache offline sincronizado
        return mapped;
      }
      if (error) {
        console.warn("Supabase fetchWorks avisou:", error.message);
      }
    } catch (err) {
      console.warn("Falha de rede em fetchWorks:", err);
    }
  }
  return getStoredProjects();
}

export async function fetchArticles(includeDrafts = false) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("articles")
        .select("*")
        .order("display_order", { ascending: true });

      if (!includeDrafts) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapDbArticle);
        saveArticles(mapped);
        return mapped;
      }
      if (error) {
        console.warn("Supabase fetchArticles avisou:", error.message);
      }
    } catch (err) {
      console.warn("Falha de rede em fetchArticles:", err);
    }
  }
  return getStoredArticles();
}

export async function fetchThoughts(includeDrafts = false) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("thoughts")
        .select("*")
        .order("display_order", { ascending: true });

      if (!includeDrafts) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapDbThought);
        saveThoughts(mapped);
        return mapped;
      }
      if (error) {
        console.warn("Supabase fetchThoughts avisou:", error.message);
      }
    } catch (err) {
      console.warn("Falha de rede em fetchThoughts:", err);
    }
  }
  return getStoredThoughts();
}

export async function fetchExperiences(includeDrafts = false) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("experiences")
        .select("*")
        .order("display_order", { ascending: true });

      if (!includeDrafts) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapDbExperience);
        saveExperiences(mapped);
        return mapped;
      }
      if (error) {
        console.warn("Supabase fetchExperiences avisou:", error.message);
      }
    } catch (err) {
      console.warn("Falha de rede em fetchExperiences:", err);
    }
  }
  return getStoredExperiences();
}

export async function fetchCvConfig() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("cv_configs")
        .select("*")
        .eq("id", "production")
        .maybeSingle();

      if (!error && data) {
        const config = {
          googleDocsUrl: data.google_docs_url || "",
          pdfUrl: data.pdf_url || "",
          updatedAt: data.updated_at ? data.updated_at.split("T")[0] : ""
        };
        saveCvConfig(config);
        return config;
      }
    } catch (err) {
      console.warn("Falha ao buscar cv_configs do Supabase:", err);
    }
  }
  return getStoredCvConfig();
}

export async function fetchAgentConfig() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("agent_configs")
        .select("*")
        .eq("id", "production")
        .maybeSingle();

      if (!error && data) {
        return {
          modelName: data.model_name,
          systemPrompt: data.system_prompt,
          maxTokens: data.max_tokens,
          temperature: data.temperature
        };
      }
    } catch (err) {
      console.warn("Falha ao buscar agent_configs do Supabase:", err);
    }
  }
  return null;
}

// ==========================================
// OPERAÇÕES DE SALVAR & EXCLUIR (PERSISTÊNCIA)
// ==========================================

export async function persistWork(item) {
  // 1. Atualiza LocalStorage
  const current = getStoredProjects();
  const idx = current.findIndex((p) => p.id === item.id);
  let updatedList;
  if (idx >= 0) {
    updatedList = [...current];
    updatedList[idx] = item;
  } else {
    updatedList = [item, ...current];
  }
  saveProjects(updatedList);

  // 2. Persiste no Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = mapProjectToDbWork(item);
      const { error } = await supabase.from("works").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao salvar projeto no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function removeWork(id) {
  const current = getStoredProjects();
  saveProjects(current.filter((p) => p.id !== id));

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("works").delete().eq("id", id);
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao remover projeto no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function persistArticle(item) {
  const current = getStoredArticles();
  const idx = current.findIndex((a) => a.id === item.id);
  let updatedList;
  if (idx >= 0) {
    updatedList = [...current];
    updatedList[idx] = item;
  } else {
    updatedList = [item, ...current];
  }
  saveArticles(updatedList);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = mapArticleToDb(item);
      const { error } = await supabase.from("articles").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao salvar artigo no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function removeArticle(id) {
  const current = getStoredArticles();
  saveArticles(current.filter((a) => a.id !== id));

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao remover artigo no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function persistThought(item) {
  const current = getStoredThoughts();
  const idx = current.findIndex((t) => t.id === item.id);
  let updatedList;
  if (idx >= 0) {
    updatedList = [...current];
    updatedList[idx] = item;
  } else {
    updatedList = [item, ...current];
  }
  saveThoughts(updatedList);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = mapThoughtToDb(item);
      const { error } = await supabase.from("thoughts").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao salvar pensamento no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function removeThought(id) {
  const current = getStoredThoughts();
  saveThoughts(current.filter((t) => t.id !== id));

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("thoughts").delete().eq("id", id);
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao remover pensamento no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function persistExperience(item) {
  const current = getStoredExperiences();
  const idx = current.findIndex((e) => e.id === item.id);
  let updatedList;
  if (idx >= 0) {
    updatedList = [...current];
    updatedList[idx] = item;
  } else {
    updatedList = [item, ...current];
  }
  saveExperiences(updatedList);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = mapExperienceToDb(item);
      const { error } = await supabase.from("experiences").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao salvar experiência no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function removeExperience(id) {
  const current = getStoredExperiences();
  saveExperiences(current.filter((e) => e.id !== id));

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("experiences").delete().eq("id", id);
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao remover experiência no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function persistCvConfig(config) {
  saveCvConfig(config);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("cv_configs").upsert(
        {
          id: "production",
          google_docs_url: config.googleDocsUrl,
          pdf_url: config.pdfUrl,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao salvar CV no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function persistAgentConfig(systemPrompt, modelName = "Qwen 2.5 Coder 32B-Instruct") {
  localStorage.setItem("portfolio_agent_system_prompt", systemPrompt);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("agent_configs").upsert(
        {
          id: "production",
          model_name: modelName,
          system_prompt: systemPrompt,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao salvar configuração do Agente no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

// Salva ordenação em lote
export async function persistBatchOrder(type, orderedItems) {
  if (type === "projects") {
    saveProjects(orderedItems);
    if (isSupabaseConfigured && supabase) {
      try {
        const updates = orderedItems.map((item, index) =>
          supabase
            .from("works")
            .update({ display_order: index })
            .eq("id", item.id)
        );
        await Promise.all(updates);
        return { success: true, cloud: true };
      } catch (err) {
        console.error("Erro ao ordenar works no Supabase:", err);
      }
    }
  } else if (type === "articles") {
    saveArticles(orderedItems);
    if (isSupabaseConfigured && supabase) {
      try {
        const updates = orderedItems.map((item, index) =>
          supabase
            .from("articles")
            .update({ display_order: index })
            .eq("id", item.id)
        );
        await Promise.all(updates);
        return { success: true, cloud: true };
      } catch (err) {
        console.error("Erro ao ordenar articles no Supabase:", err);
      }
    }
  } else if (type === "thoughts") {
    saveThoughts(orderedItems);
    if (isSupabaseConfigured && supabase) {
      try {
        const updates = orderedItems.map((item, index) =>
          supabase
            .from("thoughts")
            .update({ display_order: index })
            .eq("id", item.id)
        );
        await Promise.all(updates);
        return { success: true, cloud: true };
      } catch (err) {
        console.error("Erro ao ordenar thoughts no Supabase:", err);
      }
    }
  }
  return { success: true, cloud: false };
}

// ==========================================
// SUPABASE AUTHENTICATION (AUTENTICAÇÃO)
// ==========================================

export async function loginWithEmail(email, password) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase não configurado no arquivo .env");
  }
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signupWithEmail(email, password) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase não configurado no arquivo .env");
  }
  return await supabase.auth.signUp({ email, password });
}

export async function loginWithGitHub() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase não configurado no arquivo .env");
  }
  return await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/4dm1n`
    }
  });
}

export async function logoutUser() {
  if (!isSupabaseConfigured || !supabase) return;
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getAuthSession() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthChange(callback) {
  if (!isSupabaseConfigured || !supabase) return { unsubscribe: () => {} };
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}
