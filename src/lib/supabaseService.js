// src/lib/supabaseService.js
// Camada unificada de dados: Supabase Cloud + LocalStorage Fallback transparente

import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import {
  DEFAULT_PROJECTS,
  getStoredProjects,
  saveProjects,
  getStoredArticles,
  saveArticles,
  getStoredThoughts,
  saveThoughts,
  getStoredExperiences,
  saveExperiences,
  getStoredCvConfig,
  saveCvConfig,
  getStoredDrawings,
  saveDrawings,
  getStoredCustomHobby,
  saveCustomHobby,
  getStoredHobbies,
  saveHobbies,
  getStoredProfileConfig,
  saveProfileConfig
} from "../data/projectsData.js";
import {
  getStoredBlogPosts,
  saveBlogPosts,
  DEFAULT_BLOG_POSTS
} from "../data/blogData.js";

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

const BILINGUAL_SPLIT = "<!-- BILINGUAL_SPLIT -->";

export function mapDbWorkToProject(row) {
  const existing = getStoredProjects().find((p) => p.id === row.id);

  let titleEn = row.title_en || existing?.titleEn || row.title || "";
  let titlePt = row.title_pt || existing?.titlePt || row.title || "";
  if (row.title && row.title.includes(BILINGUAL_SPLIT)) {
    const parts = row.title.split(BILINGUAL_SPLIT);
    titleEn = parts[0].trim();
    titlePt = parts[1].trim();
  }

  let shortDescEn = row.short_description_en || existing?.shortDescriptionEn || row.short_description || "";
  let shortDescPt = row.short_description_pt || existing?.shortDescriptionPt || row.short_description || "";
  if (row.short_description && row.short_description.includes(BILINGUAL_SPLIT)) {
    const parts = row.short_description.split(BILINGUAL_SPLIT);
    shortDescEn = parts[0].trim();
    shortDescPt = parts[1].trim();
  }

  let aboutEn = row.about_context_en || existing?.aboutContextEn || row.about_context || "";
  let aboutPt = row.about_context_pt || existing?.aboutContextPt || row.about_context || "";
  if (row.about_context && row.about_context.includes(BILINGUAL_SPLIT)) {
    const parts = row.about_context.split(BILINGUAL_SPLIT);
    aboutEn = parts[0].trim();
    aboutPt = parts[1].trim();
  }

  let contentEn = row.content_en || existing?.contentEn || "";
  let contentPt = row.content_pt || existing?.contentPt || "";
  if (row.content && row.content.includes(BILINGUAL_SPLIT)) {
    const parts = row.content.split(BILINGUAL_SPLIT);
    contentEn = parts[0].trim();
    contentPt = parts[1].trim();
  } else if (!contentEn && !contentPt && row.content) {
    contentEn = row.content;
    contentPt = row.content;
  }

  return {
    id: row.id,
    title: titleEn || row.title,
    titleEn,
    titlePt,
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    shortDescription: shortDescEn || row.short_description || "",
    shortDescriptionEn: shortDescEn,
    shortDescriptionPt: shortDescPt,
    aboutContext: aboutEn || row.about_context || "",
    aboutContextEn: aboutEn,
    aboutContextPt: aboutPt,
    github: row.github_url || "",
    demo: row.demo_url || "",
    contentType: row.content_type || "markdown",
    googleDocsUrl: row.google_docs_url || "",
    pdfUrl: row.pdf_url || "",
    content: contentEn || row.content || "",
    contentEn: contentEn || existing?.contentEn || row.content || "",
    contentPt: contentPt || existing?.contentPt || row.content || "",
    relatedArticleId: row.related_article_id || "",
    displayOrder: row.display_order ?? 0,
    isPublished: row.is_published ?? true,
    updatedAt: row.updated_at ? row.updated_at.split("T")[0] : ""
  };
}

export function mapProjectToDbWork(item) {
  const rawTitle = (item.titleEn && item.titlePt && item.titleEn !== item.titlePt)
    ? `${item.titleEn.trim()} ${BILINGUAL_SPLIT} ${item.titlePt.trim()}`
    : (item.titleEn || item.title || "");
  const titleToSave = rawTitle.slice(0, 255);

  const shortDescToSave = (item.shortDescriptionEn && item.shortDescriptionPt && item.shortDescriptionEn !== item.shortDescriptionPt)
    ? `${item.shortDescriptionEn.trim()} ${BILINGUAL_SPLIT} ${item.shortDescriptionPt.trim()}`
    : (item.shortDescriptionEn || item.shortDescription || "");

  const aboutToSave = (item.aboutContextEn && item.aboutContextPt && item.aboutContextEn !== item.aboutContextPt)
    ? `${item.aboutContextEn.trim()} ${BILINGUAL_SPLIT} ${item.aboutContextPt.trim()}`
    : (item.aboutContextEn || item.aboutContext || "");

  const contentToSave = (item.contentEn && item.contentPt && item.contentEn !== item.contentPt)
    ? `${item.contentEn.trim()}\n\n${BILINGUAL_SPLIT}\n\n${item.contentPt.trim()}`
    : (item.contentEn || item.content || "");

  const VALID_CATEGORIES = ["Profissional", "Pessoal", "Acadêmico"];
  const categoryToSave = VALID_CATEGORIES.includes(item.category) ? item.category : "Profissional";
  const relatedArticleId = (item.relatedArticleId && typeof item.relatedArticleId === "string" && item.relatedArticleId.trim())
    ? item.relatedArticleId.trim()
    : null;

  return {
    id: item.id,
    title: titleToSave,
    category: categoryToSave,
    tags: Array.isArray(item.tags)
      ? item.tags
      : typeof item.tags === "string"
        ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    short_description: shortDescToSave,
    about_context: aboutToSave,
    github_url: item.github || "",
    demo_url: item.demo || "",
    content_type: item.contentType || "markdown",
    google_docs_url: item.googleDocsUrl || "",
    pdf_url: item.pdfUrl || "",
    content: contentToSave,
    related_article_id: relatedArticleId,
    display_order: item.displayOrder ?? 0,
    is_published: item.isPublished !== false
  };
}

export function mapDbArticle(row) {
  const existing = getStoredArticles().find((a) => a.id === row.id);

  let titleEn = row.title_en || existing?.titleEn || row.title || "";
  let titlePt = row.title_pt || existing?.titlePt || row.title || "";
  if (row.title && row.title.includes(BILINGUAL_SPLIT)) {
    const parts = row.title.split(BILINGUAL_SPLIT);
    titleEn = parts[0].trim();
    titlePt = parts[1].trim();
  }

  let shortDescEn = row.short_description_en || existing?.shortDescriptionEn || row.short_description || "";
  let shortDescPt = row.short_description_pt || existing?.shortDescriptionPt || row.short_description || "";
  if (row.short_description && row.short_description.includes(BILINGUAL_SPLIT)) {
    const parts = row.short_description.split(BILINGUAL_SPLIT);
    shortDescEn = parts[0].trim();
    shortDescPt = parts[1].trim();
  }

  let aboutEn = row.about_context_en || existing?.aboutContextEn || row.about_context || "";
  let aboutPt = row.about_context_pt || existing?.aboutContextPt || row.about_context || "";
  if (row.about_context && row.about_context.includes(BILINGUAL_SPLIT)) {
    const parts = row.about_context.split(BILINGUAL_SPLIT);
    aboutEn = parts[0].trim();
    aboutPt = parts[1].trim();
  }

  let contentEn = row.content_en || existing?.contentEn || "";
  let contentPt = row.content_pt || existing?.contentPt || "";
  if (row.content && row.content.includes(BILINGUAL_SPLIT)) {
    const parts = row.content.split(BILINGUAL_SPLIT);
    contentEn = parts[0].trim();
    contentPt = parts[1].trim();
  } else if (!contentEn && !contentPt && row.content) {
    contentEn = row.content;
    contentPt = row.content;
  }

  let docsEn = row.google_docs_url_en || existing?.googleDocsUrlEn || "";
  let docsPt = row.google_docs_url_pt || existing?.googleDocsUrlPt || "";
  if (row.google_docs_url && row.google_docs_url.includes(BILINGUAL_SPLIT)) {
    const parts = row.google_docs_url.split(BILINGUAL_SPLIT);
    docsEn = parts[0].trim();
    docsPt = parts[1].trim();
  } else if (!docsEn && !docsPt && row.google_docs_url) {
    docsEn = row.google_docs_url;
    docsPt = row.google_docs_url;
  }

  return {
    id: row.id,
    title: titleEn || row.title,
    titleEn,
    titlePt,
    category: row.category || "Acadêmico",
    tags: Array.isArray(row.tags) ? row.tags : [],
    shortDescription: shortDescEn || row.short_description || "",
    shortDescriptionEn: shortDescEn,
    shortDescriptionPt: shortDescPt,
    aboutContext: aboutEn || row.about_context || "",
    aboutContextEn: aboutEn,
    aboutContextPt: aboutPt,
    contentType: row.content_type || "markdown",
    googleDocsUrl: docsEn || docsPt || row.google_docs_url || "",
    googleDocsUrlEn: docsEn,
    googleDocsUrlPt: docsPt,
    pdfUrl: row.pdf_url || "",
    content: contentEn || row.content || "",
    contentEn: contentEn || existing?.contentEn || row.content || "",
    contentPt: contentPt || existing?.contentPt || row.content || "",
    relatedProjectId: row.related_work_id || "",
    displayOrder: row.display_order ?? 0,
    isPublished: row.is_published ?? true,
    updatedAt: row.updated_at ? row.updated_at.split("T")[0] : ""
  };
}

export function mapArticleToDb(item) {
  const rawTitle = (item.titleEn && item.titlePt && item.titleEn !== item.titlePt)
    ? `${item.titleEn.trim()} ${BILINGUAL_SPLIT} ${item.titlePt.trim()}`
    : (item.titleEn || item.title || "");
  const titleToSave = rawTitle.slice(0, 255);

  const shortDescToSave = (item.shortDescriptionEn && item.shortDescriptionPt && item.shortDescriptionEn !== item.shortDescriptionPt)
    ? `${item.shortDescriptionEn.trim()} ${BILINGUAL_SPLIT} ${item.shortDescriptionPt.trim()}`
    : (item.shortDescriptionEn || item.shortDescription || "");

  const aboutToSave = (item.aboutContextEn && item.aboutContextPt && item.aboutContextEn !== item.aboutContextPt)
    ? `${item.aboutContextEn.trim()} ${BILINGUAL_SPLIT} ${item.aboutContextPt.trim()}`
    : (item.aboutContextEn || item.aboutContext || "");

  const contentToSave = (item.contentEn && item.contentPt && item.contentEn !== item.contentPt)
    ? `${item.contentEn.trim()}\n\n${BILINGUAL_SPLIT}\n\n${item.contentPt.trim()}`
    : (item.contentEn || item.content || "");

  const docsToSave = (item.googleDocsUrlEn && item.googleDocsUrlPt && item.googleDocsUrlEn !== item.googleDocsUrlPt)
    ? `${item.googleDocsUrlEn.trim()} ${BILINGUAL_SPLIT} ${item.googleDocsUrlPt.trim()}`
    : (item.googleDocsUrlEn || item.googleDocsUrlPt || item.googleDocsUrl || "");

  const VALID_CATEGORIES = ["Profissional", "Pessoal", "Acadêmico"];
  const categoryToSave = VALID_CATEGORIES.includes(item.category) ? item.category : "Acadêmico";
  const relatedWorkId = (item.relatedProjectId && typeof item.relatedProjectId === "string" && item.relatedProjectId.trim())
    ? item.relatedProjectId.trim()
    : null;

  return {
    id: item.id,
    title: titleToSave,
    category: categoryToSave,
    tags: Array.isArray(item.tags)
      ? item.tags
      : typeof item.tags === "string"
        ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    short_description: shortDescToSave,
    about_context: aboutToSave,
    content_type: item.contentType || "markdown",
    google_docs_url: docsToSave,
    pdf_url: item.pdfUrl || "",
    content: contentToSave,
    related_work_id: relatedWorkId,
    display_order: item.displayOrder ?? 0,
    is_published: item.isPublished !== false
  };
}

export function mapDbThought(row) {
  const existing = getStoredThoughts().find((t) => t.id === row.id);

  let titleEn = row.title_en || existing?.titleEn || row.title || "";
  let titlePt = row.title_pt || existing?.titlePt || row.title || "";
  if (row.title && row.title.includes(BILINGUAL_SPLIT)) {
    const parts = row.title.split(BILINGUAL_SPLIT);
    titleEn = parts[0].trim();
    titlePt = parts[1].trim();
  }

  let aboutEn = row.about_context_en || existing?.aboutContextEn || row.about_context || "";
  let aboutPt = row.about_context_pt || existing?.aboutContextPt || row.about_context || "";
  if (row.about_context && row.about_context.includes(BILINGUAL_SPLIT)) {
    const parts = row.about_context.split(BILINGUAL_SPLIT);
    aboutEn = parts[0].trim();
    aboutPt = parts[1].trim();
  }

  let contentEn = row.content_en || existing?.contentEn || "";
  let contentPt = row.content_pt || existing?.contentPt || "";
  if (row.content && row.content.includes(BILINGUAL_SPLIT)) {
    const parts = row.content.split(BILINGUAL_SPLIT);
    contentEn = parts[0].trim();
    contentPt = parts[1].trim();
  } else if (!contentEn && !contentPt && row.content) {
    contentEn = row.content;
    contentPt = row.content;
  }

  return {
    id: row.id,
    title: titleEn || row.title,
    titleEn,
    titlePt,
    category: row.category || "Pessoal",
    tags: Array.isArray(row.tags) ? row.tags : [],
    shortDescription: row.short_description || "",
    aboutContext: aboutEn || row.about_context || "",
    aboutContextEn: aboutEn,
    aboutContextPt: aboutPt,
    contentType: row.content_type || "markdown",
    googleDocsUrl: row.google_docs_url || "",
    pdfUrl: row.pdf_url || "",
    content: contentEn || row.content || "",
    contentEn: contentEn || existing?.contentEn || row.content || "",
    contentPt: contentPt || existing?.contentPt || row.content || "",
    displayOrder: row.display_order ?? 0,
    isPublished: row.is_published ?? true,
    updatedAt: row.updated_at ? row.updated_at.split("T")[0] : ""
  };
}

export function mapThoughtToDb(item) {
  const titleToSave = (item.titleEn && item.titlePt && item.titleEn !== item.titlePt)
    ? `${item.titleEn.trim()} ${BILINGUAL_SPLIT} ${item.titlePt.trim()}`
    : (item.titleEn || item.title || "");

  const aboutToSave = (item.aboutContextEn && item.aboutContextPt && item.aboutContextEn !== item.aboutContextPt)
    ? `${item.aboutContextEn.trim()} ${BILINGUAL_SPLIT} ${item.aboutContextPt.trim()}`
    : (item.aboutContextEn || item.aboutContext || "");

  const contentToSave = (item.contentEn && item.contentPt && item.contentEn !== item.contentPt)
    ? `${item.contentEn.trim()}\n\n${BILINGUAL_SPLIT}\n\n${item.contentPt.trim()}`
    : (item.contentEn || item.content || "");

  return {
    id: item.id,
    title: titleToSave,
    category: item.category || "Pessoal",
    tags: Array.isArray(item.tags)
      ? item.tags
      : typeof item.tags === "string"
        ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
    short_description: item.shortDescriptionEn || item.shortDescription || "",
    about_context: aboutToSave,
    content_type: item.contentType || "markdown",
    google_docs_url: item.googleDocsUrl || "",
    pdf_url: item.pdfUrl || "",
    content: contentToSave,
    display_order: item.displayOrder ?? 0,
    is_published: item.isPublished !== false
  };
}

export function mapDbExperience(row) {
  const existing = getStoredExperiences().find((e) => e.id === row.id);

  let titleEn = row.title_en || existing?.titleEn || row.title || "";
  let titlePt = row.title_pt || existing?.titlePt || row.title || "";
  if (row.title && row.title.includes(BILINGUAL_SPLIT)) {
    const parts = row.title.split(BILINGUAL_SPLIT);
    titleEn = parts[0].trim();
    titlePt = parts[1].trim();
  }

  let timeEn = row.time_en || existing?.timeEn || row.time || "";
  let timePt = row.time_pt || existing?.timePt || row.time || "";
  if (row.time && row.time.includes(BILINGUAL_SPLIT)) {
    const parts = row.time.split(BILINGUAL_SPLIT);
    timeEn = parts[0].trim();
    timePt = parts[1].trim();
  }

  let bulletsEn = [];
  let bulletsPt = [];
  const rawBullets = Array.isArray(row.bullets) ? row.bullets : [];
  for (const b of rawBullets) {
    if (typeof b === "string" && b.includes(BILINGUAL_SPLIT)) {
      const parts = b.split(BILINGUAL_SPLIT);
      bulletsEn.push(parts[0].trim());
      bulletsPt.push(parts[1].trim());
    } else {
      bulletsEn.push(b);
      bulletsPt.push(b);
    }
  }

  if (bulletsEn.length === 0) {
    bulletsEn = existing?.bulletsEn || rawBullets;
  }
  if (bulletsPt.length === 0) {
    bulletsPt = existing?.bulletsPt || rawBullets;
  }

  return {
    id: row.id,
    title: titleEn || row.title,
    titleEn,
    titlePt,
    company: row.company,
    time: timeEn || row.time,
    timeEn,
    timePt,
    bullets: bulletsEn.length > 0 ? bulletsEn : rawBullets,
    bulletsEn,
    bulletsPt,
    displayOrder: row.display_order ?? 0,
    isPublished: row.is_published ?? true,
    updatedAt: row.updated_at ? row.updated_at.split("T")[0] : ""
  };
}

export function mapExperienceToDb(item) {
  const titleToSave = (item.titleEn && item.titlePt && item.titleEn !== item.titlePt)
    ? `${item.titleEn.trim()} ${BILINGUAL_SPLIT} ${item.titlePt.trim()}`
    : (item.titleEn || item.title || "");

  const timeToSave = (item.timeEn && item.timePt && item.timeEn !== item.timePt)
    ? `${item.timeEn.trim()} ${BILINGUAL_SPLIT} ${item.timePt.trim()}`
    : (item.timeEn || item.time || "");

  const bEn = Array.isArray(item.bulletsEn) ? item.bulletsEn : (Array.isArray(item.bullets) ? item.bullets : []);
  const bPt = Array.isArray(item.bulletsPt) ? item.bulletsPt : (Array.isArray(item.bullets) ? item.bullets : []);

  const mergedBullets = [];
  const maxLen = Math.max(bEn.length, bPt.length);
  for (let i = 0; i < maxLen; i++) {
    const en = bEn[i] || "";
    const pt = bPt[i] || "";
    if (en && pt && en !== pt) {
      mergedBullets.push(`${en} ${BILINGUAL_SPLIT} ${pt}`);
    } else {
      mergedBullets.push(en || pt);
    }
  }

  return {
    id: item.id,
    title: titleToSave,
    company: item.company,
    time: timeToSave,
    bullets: mergedBullets,
    display_order: item.displayOrder ?? 0,
    is_published: item.isPublished !== false
  };
}

export function mapDbDrawing(row) {
  const existing = getStoredDrawings().find((d) => d.id === row.id);
  return {
    id: row.id,
    title: row.title,
    titleEn: row.title_en || existing?.titleEn || row.title,
    titlePt: row.title_pt || existing?.titlePt || row.title,
    src: row.image_url || row.src || "",
    description: row.description || "",
    descriptionEn: row.description_en || existing?.descriptionEn || row.description || "",
    descriptionPt: row.description_pt || existing?.descriptionPt || row.description || "",
    displayOrder: row.display_order ?? 0,
    isPublished: row.is_published ?? true,
    updatedAt: row.updated_at ? row.updated_at.split("T")[0] : ""
  };
}

export function mapDrawingToDb(item) {
  return {
    id: item.id,
    title: item.titleEn || item.title || item.titlePt || "",
    image_url: item.src || item.imageUrl || "",
    description: item.descriptionEn || item.description || item.descriptionPt || "",
    display_order: item.displayOrder ?? 0,
    is_published: item.isPublished !== false,
    updated_at: new Date().toISOString()
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
      if (!error && Array.isArray(data)) {
        const mapped = data.map(mapDbWorkToProject);
        // Garante que projetos essenciais (como o projeto do próprio portfólio) apareçam preservando edições locais
        const remoteIds = new Set(mapped.map((p) => p.id));
        const storedLocal = getStoredProjects();
        const missingDefaults = DEFAULT_PROJECTS.filter((p) => !remoteIds.has(p.id)).map((def) => {
          const locallyEdited = storedLocal.find((l) => l.id === def.id);
          return locallyEdited || def;
        });
        const combined = [...mapped, ...missingDefaults];

        saveProjects(combined); // Mantém cache offline sincronizado
        return combined;
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
      if (!error && Array.isArray(data)) {
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
      if (!error && Array.isArray(data)) {
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
      if (!error && Array.isArray(data)) {
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

export async function fetchDrawings(includeDrafts = false) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("drawings")
        .select("*")
        .order("display_order", { ascending: true });

      if (!includeDrafts) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        const mapped = data.map(mapDbDrawing);
        saveDrawings(mapped);
        return mapped;
      }
      if (error) {
        console.warn("Supabase fetchDrawings avisou:", error.message);
      }
    } catch (err) {
      console.warn("Falha de rede em fetchDrawings:", err);
    }
  }
  return getStoredDrawings();
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
        let docsEn = data.google_docs_url || "";
        let docsPt = data.google_docs_url || "";
        if (data.google_docs_url && data.google_docs_url.includes(BILINGUAL_SPLIT)) {
          const parts = data.google_docs_url.split(BILINGUAL_SPLIT);
          docsEn = parts[0].trim();
          docsPt = parts[1].trim();
        }

        let pdfEn = data.pdf_url || "";
        let pdfPt = data.pdf_url || "";
        if (data.pdf_url && data.pdf_url.includes(BILINGUAL_SPLIT)) {
          const parts = data.pdf_url.split(BILINGUAL_SPLIT);
          pdfEn = parts[0].trim();
          pdfPt = parts[1].trim();
        }

        const existing = getStoredCvConfig();
        const config = {
          ...existing,
          googleDocsUrl: docsEn || existing.googleDocsUrl,
          googleDocsUrlEn: docsEn || existing.googleDocsUrlEn || existing.googleDocsUrl,
          googleDocsUrlPt: docsPt || existing.googleDocsUrlPt || existing.googleDocsUrl,
          pdfUrl: pdfEn || existing.pdfUrl,
          pdfUrlEn: pdfEn || existing.pdfUrlEn || existing.pdfUrl,
          pdfUrlPt: pdfPt || existing.pdfUrlPt || existing.pdfUrl,
          updatedAt: data.updated_at ? data.updated_at.split("T")[0] : existing.updatedAt
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

export function embedMetadataInPrompt(basePrompt, tag, data) {
  if (!basePrompt || typeof basePrompt !== "string") basePrompt = "";
  const regex = new RegExp(`<!--\\s*${tag}:\\s*([\\s\\S]*?)\\s*-->\\n?`, "g");
  const encoded = encodeURIComponent(JSON.stringify(data));
  const newTag = `<!-- ${tag}: ${encoded} -->\n`;
  if (regex.test(basePrompt)) {
    return basePrompt.replace(regex, newTag);
  }
  return `${newTag}${basePrompt}`;
}

export function extractMetadataFromPrompt(prompt, tag) {
  if (!prompt || typeof prompt !== "string") return null;
  const regex = new RegExp(`<!--\\s*${tag}:\\s*([\\s\\S]*?)\\s*-->`);
  const match = prompt.match(regex);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch (e) {
    try {
      return JSON.parse(match[1]);
    } catch (err) {
      return null;
    }
  }
}

export function extractKeyFromPrompt(prompt) {
  if (!prompt || typeof prompt !== "string") return "";
  const match = prompt.match(/<!--\s*AGENT_KEY:\s*([^\s>]+)\s*-->/);
  return match ? match[1] : "";
}

export function cleanPromptFromKey(prompt) {
  if (!prompt || typeof prompt !== "string") return "";
  return prompt.replace(/<!--\s*[A-Z_]+:\s*[\s\S]*?-->\n?/g, "").trim();
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
        const groqApiKey = data.groq_api_key || extractKeyFromPrompt(data.system_prompt) || "";
        return {
          modelName: data.model_name,
          systemPrompt: cleanPromptFromKey(data.system_prompt),
          rawSystemPrompt: data.system_prompt,
          maxTokens: data.max_tokens,
          temperature: data.temperature,
          hasApiKey: Boolean(groqApiKey),
          groqApiKey: groqApiKey
        };
      }
    } catch (err) {
      console.warn("Falha ao buscar agent_configs do Supabase:", err);
    }
  }
  return null;
}

export async function fetchCustomHobby() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("agent_configs")
        .select("custom_hobby_json")
        .eq("id", "production")
        .maybeSingle();

      if (!error && data?.custom_hobby_json) {
        saveCustomHobby(data.custom_hobby_json);
        return data.custom_hobby_json;
      }
    } catch (err) {
      console.warn("Falha ao buscar custom_hobby_json do Supabase:", err);
    }
  }
  return getStoredCustomHobby();
}

export async function persistCustomHobby(hobbyData) {
  saveCustomHobby(hobbyData);
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("agent_configs")
        .upsert(
          {
            id: "production",
            custom_hobby_json: hobbyData,
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );
      if (error && error.message && error.message.includes("custom_hobby_json")) {
        return { success: true, cloud: false };
      }
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao persistir custom hobby:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export function mapDbHobby(row) {
  return {
    id: row.id,
    category: row.category || "Hobby",
    layout: row.layout || "",
    titlePt: row.title_pt || "",
    titleEn: row.title_en || "",
    descriptionPt: row.description_pt || "",
    descriptionEn: row.description_en || "",
    photoUrl: row.photo_url || "",
    displayOrder: typeof row.display_order === "number" ? row.display_order : 0,
    isPublished: row.is_published !== false
  };
}

export function mapHobbyToDb(hobby) {
  return {
    id: hobby.id || `hobby-${Date.now()}`,
    category: hobby.category || "Hobby",
    layout: hobby.layout || "",
    title_pt: hobby.titlePt || "",
    title_en: hobby.titleEn || "",
    description_pt: hobby.descriptionPt || "",
    description_en: hobby.descriptionEn || "",
    photo_url: hobby.photoUrl || "",
    display_order: typeof hobby.displayOrder === "number" ? hobby.displayOrder : 0,
    is_published: hobby.isPublished !== false,
    updated_at: new Date().toISOString()
  };
}

export async function fetchHobbies() {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Tenta buscar direto da tabela public.hobbies
      const { data: hobbiesData, error: hobbiesErr } = await supabase
        .from("hobbies")
        .select("*")
        .order("display_order", { ascending: true });

      if (!hobbiesErr && Array.isArray(hobbiesData) && hobbiesData.length > 0) {
        const mapped = hobbiesData.map(mapDbHobby);
        saveHobbies(mapped);
        return mapped;
      }

      // 2. Fallback: buscar de agent_configs.custom_hobby_json ou system_prompt
      const { data, error } = await supabase
        .from("agent_configs")
        .select("custom_hobby_json, system_prompt")
        .eq("id", "production")
        .maybeSingle();

      if (!error && data?.custom_hobby_json) {
        if (Array.isArray(data.custom_hobby_json) && data.custom_hobby_json.length > 0) {
          saveHobbies(data.custom_hobby_json);
          return data.custom_hobby_json;
        } else if (data.custom_hobby_json?.hobbiesList && Array.isArray(data.custom_hobby_json.hobbiesList) && data.custom_hobby_json.hobbiesList.length > 0) {
          saveHobbies(data.custom_hobby_json.hobbiesList);
          return data.custom_hobby_json.hobbiesList;
        }
      }

      if (data?.system_prompt) {
        const meta = extractMetadataFromPrompt(data.system_prompt, "HOBBIES_LIST");
        if (Array.isArray(meta) && meta.length > 0) {
          saveHobbies(meta);
          return meta;
        }
      }
    } catch (err) {
      console.warn("Falha ao buscar hobbies do Supabase:", err);
    }
  }
  return getStoredHobbies();
}

export async function persistHobbies(hobbiesList) {
  saveHobbies(hobbiesList);
  let isCloud = false;
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Upsert na tabela public.hobbies
      const dbPayloads = hobbiesList.map(mapHobbyToDb);
      const { error: hobbiesErr } = await supabase
        .from("hobbies")
        .upsert(dbPayloads, { onConflict: "id" });

      if (!hobbiesErr) {
        isCloud = true;
      }

      // 2. Backup redundante em agent_configs.custom_hobby_json
      const configRes = await supabase
        .from("agent_configs")
        .select("system_prompt")
        .eq("id", "production")
        .maybeSingle();

      try {
        const payload = {
          hobbiesList,
          updatedAt: new Date().toISOString()
        };
        const tryJson = await supabase
          .from("agent_configs")
          .upsert(
            {
              id: "production",
              custom_hobby_json: payload,
              updated_at: new Date().toISOString()
            },
            { onConflict: "id" }
          );
        if (!tryJson.error) {
          isCloud = true;
        }
      } catch (e) {}

      // 3. Backup redundante em system_prompt
      try {
        const basePrompt = configRes.data?.system_prompt || "";
        const updatedPrompt = embedMetadataInPrompt(basePrompt, "HOBBIES_LIST", hobbiesList);
        const tryPrompt = await supabase
          .from("agent_configs")
          .upsert(
            {
              id: "production",
              system_prompt: updatedPrompt,
              updated_at: new Date().toISOString()
            },
            { onConflict: "id" }
          );
        if (!tryPrompt.error) {
          isCloud = true;
        }
      } catch (e) {}

      return { success: true, cloud: isCloud };
    } catch (err) {
      console.error("Erro ao persistir hobbies no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function removeHobby(id) {
  const current = getStoredHobbies();
  const updated = current.filter((h) => h.id !== id);
  saveHobbies(updated);

  let isCloud = false;
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("hobbies").delete().eq("id", id);
      if (!error) isCloud = true;

      try {
        await supabase.from("agent_configs").upsert(
          {
            id: "production",
            custom_hobby_json: { hobbiesList: updated, updatedAt: new Date().toISOString() },
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );
        isCloud = true;
      } catch (e) {}
    } catch (err) {
      console.warn("Erro ao excluir hobby:", err);
    }
  }
  return { success: true, cloud: isCloud };
}

export async function uploadHobbyImage(file) {
  if (!file) throw new Error("Nenhum arquivo de imagem fornecido.");

  if (isSupabaseConfigured && supabase) {
    const bucketsToTry = ["images", "documents"];
    for (const b of bucketsToTry) {
      try {
        const timestamp = Date.now();
        const cleanName = (file.name || "hobby.webp").replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `hobbies/${timestamp}-${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from(b)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type || "image/webp"
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from(b)
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            return { success: true, publicUrl: publicUrlData.publicUrl, cloud: true };
          }
        }
      } catch (err) {
        console.warn(`Tentativa no bucket ${b} para hobby avisou:`, err.message);
      }
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ success: true, publicUrl: reader.result, cloud: false, fallback: true });
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// ==========================================
// SERVIÇOS DO BLOG DUPLO (/blog & /blog/alomyr)
// ==========================================

export function mapDbPostToBlog(row) {
  return {
    id: row.id,
    channel: row.channel || "tech",
    titlePt: row.title_pt || "",
    titleEn: row.title_en || "",
    summaryPt: row.summary_pt || "",
    summaryEn: row.summary_en || "",
    category: row.category || "Geral",
    tags: Array.isArray(row.tags) ? row.tags : [],
    coverImage: row.cover_image || "",
    youtubeUrl: row.youtube_url || "",
    galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
    contentPt: row.content_pt || "",
    contentEn: row.content_en || "",
    relatedProjectId: row.related_project_id || "",
    relatedArticleId: row.related_article_id || "",
    author: row.author || "Matheus de Castro",
    publishedAt: row.published_at || new Date().toISOString().split("T")[0],
    readTime: row.read_time || "5 min",
    displayOrder: typeof row.display_order === "number" ? row.display_order : 0,
    isPublished: row.is_published !== false
  };
}

export function mapBlogPostToDb(post) {
  const publishedAt = (post.publishedAt && typeof post.publishedAt === "string" && post.publishedAt.trim())
    ? post.publishedAt.trim().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const tagsArray = Array.isArray(post.tags)
    ? post.tags
    : typeof post.tags === "string"
      ? post.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  const galleryArray = Array.isArray(post.galleryImages)
    ? post.galleryImages
    : typeof post.galleryImages === "string"
      ? post.galleryImages.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
      : [];

  return {
    id: post.id,
    channel: post.channel === "alomyr" ? "alomyr" : "tech",
    title_pt: post.titlePt || post.title_pt || "",
    title_en: post.titleEn || post.title_en || "",
    summary_pt: post.summaryPt || post.summary_pt || "",
    summary_en: post.summaryEn || post.summary_en || "",
    category: post.category || "Geral",
    tags: tagsArray,
    cover_image: post.coverImage || post.cover_image || "",
    youtube_url: post.youtubeUrl || post.youtube_url || "",
    gallery_images: galleryArray,
    content_pt: post.contentPt || post.content_pt || "",
    content_en: post.contentEn || post.content_en || "",
    related_project_id: (post.relatedProjectId && typeof post.relatedProjectId === "string" && post.relatedProjectId.trim()) ? post.relatedProjectId.trim() : null,
    related_article_id: (post.relatedArticleId && typeof post.relatedArticleId === "string" && post.relatedArticleId.trim()) ? post.relatedArticleId.trim() : null,
    author: post.author || "Matheus de Castro",
    published_at: publishedAt,
    read_time: post.readTime || post.read_time || "5 min",
    display_order: typeof post.displayOrder === "number" ? post.displayOrder : (typeof post.display_order === "number" ? post.display_order : 0),
    is_published: post.isPublished !== false,
    updated_at: new Date().toISOString()
  };
}

export async function fetchBlogPosts() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapDbPostToBlog);
        saveBlogPosts(mapped);
        return mapped;
      }

      const { data: configData, error: configErr } = await supabase
        .from("agent_configs")
        .select("custom_hobby_json, system_prompt")
        .eq("id", "production")
        .maybeSingle();

      if (!configErr && configData?.custom_hobby_json?.blogPosts && Array.isArray(configData.custom_hobby_json.blogPosts)) {
        saveBlogPosts(configData.custom_hobby_json.blogPosts);
        return configData.custom_hobby_json.blogPosts;
      }

      if (configData?.system_prompt) {
        const meta = extractMetadataFromPrompt(configData.system_prompt, "BLOG_POSTS");
        if (Array.isArray(meta) && meta.length > 0) {
          saveBlogPosts(meta);
          return meta;
        }
      }
    } catch (err) {
      console.warn("Falha ao buscar posts do blog no Supabase, usando local:", err);
    }
  }
  return getStoredBlogPosts();
}

export async function persistBlogPost(post) {
  const current = getStoredBlogPosts();
  const idx = current.findIndex((p) => p.id === post.id);
  let updatedList;
  if (idx >= 0) {
    updatedList = [...current];
    updatedList[idx] = post;
  } else {
    updatedList = [post, ...current];
  }
  saveBlogPosts(updatedList);

  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = mapBlogPostToDb(post);
      const { error } = await supabase.from("blog_posts").upsert(dbPayload, { onConflict: "id" });
      if (!error) {
        persistBlogPostsBatch(updatedList).catch(() => {});
        return { success: true, cloud: true };
      }
      console.warn("Erro ao fazer upsert em blog_posts, acionando fallback batch:", error);
      const fallback = await persistBlogPostsBatch(updatedList);
      return { success: true, cloud: fallback.cloud, error: error.message };
    } catch (err) {
      console.warn("Erro ao persistir post no Supabase (usando batch fallback):", err);
      const fallback = await persistBlogPostsBatch(updatedList);
      return { success: true, cloud: fallback.cloud, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function persistBlogPostsBatch(posts) {
  saveBlogPosts(posts);
  if (isSupabaseConfigured && supabase) {
    try {
      const configRes = await supabase
        .from("agent_configs")
        .select("custom_hobby_json, system_prompt")
        .eq("id", "production")
        .maybeSingle();

      const existingConfig = configRes.data?.custom_hobby_json || {};
      const mergedConfig = {
        ...existingConfig,
        blogPosts: posts,
        updatedAt: new Date().toISOString()
      };

      const tryJson = await supabase.from("agent_configs").upsert(
        { id: "production", custom_hobby_json: mergedConfig, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
      if (!tryJson.error) return { success: true, cloud: true };

      // Fallback em system_prompt
      const basePrompt = configRes.data?.system_prompt || "";
      const updatedPrompt = embedMetadataInPrompt(basePrompt, "BLOG_POSTS", posts);
      const tryPrompt = await supabase.from("agent_configs").upsert(
        { id: "production", system_prompt: updatedPrompt, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
      if (!tryPrompt.error) return { success: true, cloud: true };
      return { success: true, cloud: false, error: tryPrompt.error.message };
    } catch (err) {
      console.warn("Erro ao salvar batch de posts do blog:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function removeBlogPost(id) {
  const current = getStoredBlogPosts();
  const updated = current.filter((p) => p.id !== id);
  saveBlogPosts(updated);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (!error) {
        await persistBlogPostsBatch(updated);
        return { success: true, cloud: true };
      }
      return await persistBlogPostsBatch(updated);
    } catch (err) {
      console.warn("Erro ao excluir post no Supabase:", err);
      return await persistBlogPostsBatch(updated);
    }
  }
  return { success: true, cloud: false };
}

export async function uploadBlogImage(file) {
  if (!file) throw new Error("Nenhum arquivo de imagem fornecido.");

  if (isSupabaseConfigured && supabase) {
    const bucketsToTry = ["images", "documents"];
    for (const b of bucketsToTry) {
      try {
        const timestamp = Date.now();
        const cleanName = (file.name || "post_img.webp").replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `blog/${timestamp}-${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from(b)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type || "image/webp"
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from(b)
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            return { success: true, publicUrl: publicUrlData.publicUrl, cloud: true };
          }
        }
      } catch (err) {
        console.warn(`Upload imagem blog no bucket ${b} avisou:`, err.message);
      }
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve({ success: true, publicUrl: e.target.result, cloud: false, fallback: true });
    reader.onerror = () => reject(new Error("Erro ao ler imagem localmente"));
    reader.readAsDataURL(file);
  });
}

export const DEFAULT_BLOG_GATEWAY_CONFIG = {
  defaultRoute: "gateway", // "gateway" (/blog/?), "tech" (/blog), "alomyr" (/blog/alomyr)
  topBadgePt: "Ecossistema Matheus de Castro",
  topBadgeEn: "Matheus de Castro Ecosystem",
  gatewayTitlePt: "Blog & Laboratório Criativo",
  gatewayTitleEn: "Blog & Creative Laboratory",
  gatewaySubtitlePt: "Escolha qual dimensão do ecossistema você deseja explorar:",
  gatewaySubtitleEn: "Choose which dimension of the ecosystem you wish to explore:",
  wipNoticeVisible: true,
  wipNoticeBadgePt: "Em Refinamento • Prévia Editorial",
  wipNoticeBadgeEn: "Active Refinement • Editorial Preview",
  wipNoticeTextPt: "Atenção: Os canais do Blog de Engenharia e do Laboratório Alomyr estão atualmente em fase ativa de refinamento.",
  wipNoticeTextEn: "Notice: The Engineering Blog and Alomyr Lab channels are currently under active refinement.",

  // Card 1: Engenharia
  cardTechBadgePt: "Canal de Engenharia",
  cardTechBadgeEn: "Engineering Channel",
  cardTechTitlePt: "Blog de Engenharia & IA",
  cardTechTitleEn: "Engineering & AI Blog",
  cardTechDescPt: "Artigos técnicos aprofundados, arquitetura de sistemas, pipelines de telemetria, visão computacional e processos de backend.",
  cardTechDescEn: "In-depth technical papers, system architecture, telemetry pipelines, computer vision, and backend systems.",
  cardTechTags: ["#FastAPI", "#PyTorch", "#TimescaleDB", "#Telemetry", "#DevOps"],
  cardTechBtnPt: "Explorar Engenharia ↗",
  cardTechBtnEn: "Explore Engineering ↗",

  // Card 2: Alomyr
  cardAlomyrBadgePt: "Laboratório Geek & Artístico",
  cardAlomyrBadgeEn: "Geek & Creative Laboratory",
  cardAlomyrTitlePt: "Laboratório Alomyr",
  cardAlomyrTitleEn: "Alomyr Laboratory",
  cardAlomyrDescPt: "Ensaios filosóficos, arte do hiper-realismo em grafite, cultura pop/nerd, retrogaming e configurações de sistema.",
  cardAlomyrDescEn: "Philosophical essays, graphite hyper-realism art, pop/nerd culture, retrogaming, and system customization.",
  cardAlomyrTags: ["#Hiper-realismo", "#Retrogaming", "#Marvel", "#Filosofia", "#Linux"],
  cardAlomyrBtnPt: "Entrar no Laboratório ↗",
  cardAlomyrBtnEn: "Enter Laboratory ↗",

  // Footer Note
  footerNotePt: "Ambos os canais contam com links bidirecionais para os projetos técnicos e alternância rápida.",
  footerNoteEn: "Both channels offer bidirectional links to technical projects and seamless switching.",
  updatedAt: "2026-11-11"
};

export function normalizeBlogGatewayConfig(config) {
  if (!config || typeof config !== "object") return DEFAULT_BLOG_GATEWAY_CONFIG;
  return {
    ...DEFAULT_BLOG_GATEWAY_CONFIG,
    ...config,
    gatewayTitlePt: config.gatewayTitlePt || config.mainTitlePt || "Blog & Laboratório Criativo",
    gatewayTitleEn: config.gatewayTitleEn || config.mainTitleEn || "Blog & Creative Laboratory",
    mainTitlePt: config.gatewayTitlePt || config.mainTitlePt || "Blog & Laboratório Criativo",
    mainTitleEn: config.gatewayTitleEn || config.mainTitleEn || "Blog & Creative Laboratory",
    gatewaySubtitlePt: config.gatewaySubtitlePt || config.subtitlePt || "Selecione a dimensão que deseja explorar:",
    gatewaySubtitleEn: config.gatewaySubtitleEn || config.subtitleEn || "Select the dimension you want to explore:",
    subtitlePt: config.gatewaySubtitlePt || config.subtitlePt || "Selecione a dimensão que deseja explorar:",
    subtitleEn: config.gatewaySubtitleEn || config.subtitleEn || "Select the dimension you want to explore:",
    topBadgePt: config.topBadgePt || "ECOSSISTEMA MATHEUS DE CASTRO",
    topBadgeEn: config.topBadgeEn || "MATHEUS DE CASTRO ECOSYSTEM",
    wipNoticeVisible: config.wipNoticeVisible !== false && config.showBanner !== false,
    showBanner: config.wipNoticeVisible !== false && config.showBanner !== false,
    wipNoticeBadgePt: config.wipNoticeBadgePt || config.bannerBadgePt || "EM REFINAMENTO • PRÉVIA EDITORIAL",
    wipNoticeBadgeEn: config.wipNoticeBadgeEn || config.bannerBadgeEn || "UNDER REFINEMENT • EDITORIAL PREVIEW",
    bannerBadgePt: config.wipNoticeBadgePt || config.bannerBadgePt || "EM REFINAMENTO • PRÉVIA EDITORIAL",
    bannerBadgeEn: config.wipNoticeBadgeEn || config.bannerBadgeEn || "UNDER REFINEMENT • EDITORIAL PREVIEW",
    wipNoticeTextPt: config.wipNoticeTextPt || config.bannerTextPt || "Esta seção reúne ensaios de arquitetura, Machine Learning e artigos autorais de arte/retrogaming.",
    wipNoticeTextEn: config.wipNoticeTextEn || config.bannerTextEn || "This section brings together architecture essays, Machine Learning, and personal art/retrogaming articles.",
    bannerTextPt: config.wipNoticeTextPt || config.bannerTextPt || "Esta seção reúne ensaios de arquitetura, Machine Learning e artigos autorais de arte/retrogaming.",
    bannerTextEn: config.wipNoticeTextEn || config.bannerTextEn || "This section brings together architecture essays, Machine Learning, and personal art/retrogaming articles.",
    cardTechBadgePt: config.cardTechBadgePt || config.card1BadgePt || "ENGENHARIA, BACKEND & IA",
    cardTechBadgeEn: config.cardTechBadgeEn || config.card1BadgeEn || "ENGINEERING, BACKEND & AI",
    card1BadgePt: config.cardTechBadgePt || config.card1BadgePt || "ENGENHARIA, BACKEND & IA",
    card1BadgeEn: config.cardTechBadgeEn || config.card1BadgeEn || "ENGINEERING, BACKEND & AI",
    cardTechTitlePt: config.cardTechTitlePt || config.card1TitlePt || "Blog Técnico de Engenharia",
    cardTechTitleEn: config.cardTechTitleEn || config.card1TitleEn || "Technical Engineering Blog",
    card1TitlePt: config.cardTechTitlePt || config.card1TitlePt || "Blog Técnico de Engenharia",
    card1TitleEn: config.cardTechTitleEn || config.card1TitleEn || "Technical Engineering Blog",
    cardTechDescPt: config.cardTechDescPt || config.card1DescPt || "Artigos profundos de telemetria de LLMs, visão computacional, microsserviços em FastAPI e arquiteturas de alta vazão.",
    cardTechDescEn: config.cardTechDescEn || config.card1DescEn || "In-depth articles on LLM telemetry, computer vision, FastAPI microservices, and high-throughput architectures.",
    card1DescPt: config.cardTechDescPt || config.card1DescPt || "Artigos profundos de telemetria de LLMs, visão computacional, microsserviços em FastAPI e arquiteturas de alta vazão.",
    card1DescEn: config.cardTechDescEn || config.card1DescEn || "In-depth articles on LLM telemetry, computer vision, FastAPI microservices, and high-throughput architectures.",
    cardTechTags: (Array.isArray(config.cardTechTags) && config.cardTechTags.length > 0) ? config.cardTechTags : ((Array.isArray(config.card1Tags) && config.card1Tags.length > 0) ? config.card1Tags : ["#FastAPI", "#PyTorch", "#AI-Agents", "#Docker", "#TimescaleDB", "#Python"]),
    card1Tags: (Array.isArray(config.cardTechTags) && config.cardTechTags.length > 0) ? config.cardTechTags : ((Array.isArray(config.card1Tags) && config.card1Tags.length > 0) ? config.card1Tags : ["#FastAPI", "#PyTorch", "#AI-Agents", "#Docker", "#TimescaleDB", "#Python"]),
    cardTechBtnPt: config.cardTechBtnPt || config.card1BtnPt || "Acessar Artigos Técnicos →",
    cardTechBtnEn: config.cardTechBtnEn || config.card1BtnEn || "Explore Technical Articles →",
    card1BtnPt: config.cardTechBtnPt || config.card1BtnPt || "Acessar Artigos Técnicos →",
    card1BtnEn: config.cardTechBtnEn || config.card1BtnEn || "Explore Technical Articles →",
    cardAlomyrBadgePt: config.cardAlomyrBadgePt || config.card2BadgePt || "ARTE, RETROGAMIN & FILOSOFIA",
    cardAlomyrBadgeEn: config.cardAlomyrBadgeEn || config.card2BadgeEn || "ART, RETROGAMING & PHILOSOPHY",
    card2BadgePt: config.cardAlomyrBadgePt || config.card2BadgePt || "ARTE, RETROGAMIN & FILOSOFIA",
    card2BadgeEn: config.cardAlomyrBadgeEn || config.card2BadgeEn || "ART, RETROGAMING & PHILOSOPHY",
    cardAlomyrTitlePt: config.cardAlomyrTitlePt || config.card2TitlePt || "Laboratório Criativo Alomyr",
    cardAlomyrTitleEn: config.cardAlomyrTitleEn || config.card2TitleEn || "Alomyr Creative Laboratory",
    card2TitlePt: config.cardAlomyrTitlePt || config.card2TitlePt || "Laboratório Criativo Alomyr",
    card2TitleEn: config.cardAlomyrTitleEn || config.card2TitleEn || "Alomyr Creative Laboratory",
    cardAlomyrDescPt: config.cardAlomyrDescPt || config.card2DescPt || "O processo meticuloso do desenho hiper-realista a grafite, preservação e emulação retrô no Linux e ensaios sobre código e mente.",
    cardAlomyrDescEn: config.cardAlomyrDescEn || config.card2DescEn || "The meticulous process of hyper-realistic graphite drawing, Linux retro preservation/emulation, and essays on code and mind.",
    card2DescPt: config.cardAlomyrDescPt || config.card2DescPt || "O processo meticuloso do desenho hiper-realista a grafite, preservação e emulação retrô no Linux e ensaios sobre código e mente.",
    card2DescEn: config.cardAlomyrDescEn || config.card2DescEn || "The meticulous process of hyper-realistic graphite drawing, Linux retro preservation/emulation, and essays on code and mind.",
    cardAlomyrTags: (Array.isArray(config.cardAlomyrTags) && config.cardAlomyrTags.length > 0) ? config.cardAlomyrTags : ((Array.isArray(config.card2Tags) && config.card2Tags.length > 0) ? config.card2Tags : ["#Hiper-realismo", "#Grafite", "#Retrogaming", "#Linux", "#Marvel", "#Filosofia"]),
    card2Tags: (Array.isArray(config.cardAlomyrTags) && config.cardAlomyrTags.length > 0) ? config.cardAlomyrTags : ((Array.isArray(config.card2Tags) && config.card2Tags.length > 0) ? config.card2Tags : ["#Hiper-realismo", "#Grafite", "#Retrogaming", "#Linux", "#Marvel", "#Filosofia"]),
    cardAlomyrBtnPt: config.cardAlomyrBtnPt || config.card2BtnPt || "Entrar no Laboratório Alomyr →",
    cardAlomyrBtnEn: config.cardAlomyrBtnEn || config.card2BtnEn || "Enter Alomyr Laboratory →",
    card2BtnPt: config.cardAlomyrBtnPt || config.card2BtnPt || "Entrar no Laboratório Alomyr →",
    card2BtnEn: config.cardAlomyrBtnEn || config.card2BtnEn || "Enter Alomyr Laboratory →",
    footerNotePt: config.footerNotePt || "Ambos os canais possuem links bidirecionais com os projetos práticos e permitem alternância rápida.",
    footerNoteEn: config.footerNoteEn || "Both channels offer bidirectional links to technical projects and seamless switching.",
    defaultRoute: config.defaultRoute || "gateway",
    updatedAt: new Date().toISOString()
  };
}

export function getStoredBlogGatewayConfig() {
  try {
    const raw = localStorage.getItem("portfolio_blog_gateway_config");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return normalizeBlogGatewayConfig(parsed);
      }
    }
  } catch (e) {
    console.warn("Falha ao ler configuracao de blog gateway:", e);
  }
  return DEFAULT_BLOG_GATEWAY_CONFIG;
}

export function saveBlogGatewayConfig(config) {
  try {
    const normalized = normalizeBlogGatewayConfig(config);
    localStorage.setItem("portfolio_blog_gateway_config", JSON.stringify(normalized));
  } catch (e) {
    console.error("Erro ao salvar configuracao de blog gateway:", e);
  }
}

export async function fetchBlogGatewayConfig() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("agent_configs")
        .select("blog_gateway_config, system_prompt")
        .eq("id", "production")
        .maybeSingle();

      if (!error && data?.blog_gateway_config) {
        const merged = normalizeBlogGatewayConfig(data.blog_gateway_config);
        saveBlogGatewayConfig(merged);
        return merged;
      }

      if (data?.system_prompt) {
        const meta = extractMetadataFromPrompt(data.system_prompt, "GATEWAY_CONFIG");
        if (meta) {
          const merged = normalizeBlogGatewayConfig(meta);
          saveBlogGatewayConfig(merged);
          return merged;
        }
      }
    } catch (err) {
      console.warn("Falha ao buscar blog_gateway_config do Supabase:", err);
    }
  }
  return getStoredBlogGatewayConfig();
}

export async function persistBlogGatewayConfig(config) {
  const normalized = normalizeBlogGatewayConfig(config);
  saveBlogGatewayConfig(normalized);
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Tenta upsert na coluna dedicada
      const { error } = await supabase
        .from("agent_configs")
        .upsert(
          {
            id: "production",
            blog_gateway_config: normalized,
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );
      if (!error) return { success: true, cloud: true };

      // 2. Fallback redundante no system_prompt
      const agentRes = await supabase
        .from("agent_configs")
        .select("system_prompt")
        .eq("id", "production")
        .maybeSingle();

      const basePrompt = agentRes.data?.system_prompt || "";
      const updatedPrompt = embedMetadataInPrompt(basePrompt, "GATEWAY_CONFIG", normalized);

      const retry = await supabase
        .from("agent_configs")
        .upsert(
          {
            id: "production",
            system_prompt: updatedPrompt,
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );

      if (!retry.error) return { success: true, cloud: true };
      return { success: true, cloud: false, error: retry.error.message };
    } catch (err) {
      console.warn("Erro ao salvar blog_gateway_config no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

// ==========================================
// CONFIGURAÇÕES DA PÁGINA 404 PERSONALIZÁVEL
// ==========================================

export const DEFAULT_NOTFOUND_CONFIG = {
  errorCode: "404",
  badgePt: "Rota Não Encontrada",
  badgeEn: "Route Not Found",
  titlePt: "Você caiu em um vácuo cósmico",
  titleEn: "Lost in the cosmic void",
  subtitlePt: "A página ou recurso que você tentou acessar não existe, foi movida ou está temporariamente offline. Mas não se preocupe, nosso assistente Alomyr está a postos para te guiar!",
  subtitleEn: "The page or resource you requested doesn't exist, was relocated, or is temporarily offline. But don't worry, Alomyr is ready to guide you back!",
  mascotImage: "/wolf(2).png",
  backHomeTextPt: "Voltar para o Início",
  backHomeTextEn: "Back to Home",
  askAlomyrTextPt: "Perguntar ao Alomyr 💬",
  askAlomyrTextEn: "Ask Alomyr 💬",
  exploreWorksTextPt: "Ver Projetos & Artigos",
  exploreWorksTextEn: "Explore Projects & Papers",
  alomyrPromptPt: "Olá Alomyr! Me perdi em uma rota inexistente (404). Quais são os principais projetos do Matheus e como navego pelo portfólio?",
  alomyrPromptEn: "Hi Alomyr! I got lost on a 404 page. What are Matheus's main projects and how do I navigate the portfolio?",
  updatedAt: "2026-11-11"
};

export function getStoredNotFoundConfig() {
  try {
    const raw = localStorage.getItem("portfolio_notfound_config");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { ...DEFAULT_NOTFOUND_CONFIG, ...parsed };
      }
    }
  } catch (e) {
    console.warn("Falha ao ler configuracao de 404:", e);
  }
  return DEFAULT_NOTFOUND_CONFIG;
}

export function saveNotFoundConfig(config) {
  try {
    localStorage.setItem("portfolio_notfound_config", JSON.stringify(config));
  } catch (e) {
    console.error("Erro ao salvar configuracao de 404:", e);
  }
}

export async function fetchNotFoundConfig() {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Tenta buscar coluna dedicada notfound_config
      const { data, error } = await supabase
        .from("agent_configs")
        .select("notfound_config, system_prompt")
        .eq("id", "production")
        .maybeSingle();

      if (!error && data?.notfound_config) {
        const merged = { ...DEFAULT_NOTFOUND_CONFIG, ...data.notfound_config };
        saveNotFoundConfig(merged);
        return merged;
      }

      // 2. Fallback: extrai da tag de metadados do system_prompt
      if (data?.system_prompt) {
        const meta = extractMetadataFromPrompt(data.system_prompt, "NOTFOUND_CONFIG");
        if (meta) {
          const merged = { ...DEFAULT_NOTFOUND_CONFIG, ...meta };
          saveNotFoundConfig(merged);
          return merged;
        }
      }
    } catch (err) {
      console.warn("Falha ao buscar notfound_config do Supabase:", err);
    }
  }
  return getStoredNotFoundConfig();
}

export async function persistNotFoundConfig(config) {
  saveNotFoundConfig(config);
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Tenta upsert na coluna dedicada
      const { error } = await supabase
        .from("agent_configs")
        .upsert(
          {
            id: "production",
            notfound_config: config,
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );
      if (!error) return { success: true, cloud: true };

      // 2. Fallback redundante no system_prompt
      const agentRes = await supabase
        .from("agent_configs")
        .select("system_prompt")
        .eq("id", "production")
        .maybeSingle();

      const basePrompt = agentRes.data?.system_prompt || "";
      const updatedPrompt = embedMetadataInPrompt(basePrompt, "NOTFOUND_CONFIG", config);

      const retry = await supabase
        .from("agent_configs")
        .upsert(
          {
            id: "production",
            system_prompt: updatedPrompt,
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );

      if (!retry.error) return { success: true, cloud: true };
      return { success: true, cloud: false, error: retry.error.message };
    } catch (err) {
      console.warn("Erro ao salvar notfound_config no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
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
      const { data, error } = await supabase.from("works").upsert(payload, { onConflict: "id" }).select();
      if (error) throw error;
      return { success: true, cloud: true, data };
    } catch (err) {
      console.error("Erro ao salvar projeto no Supabase:", err);
      return { success: false, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function removeWork(id) {
  const current = getStoredProjects();
  saveProjects(current.filter((p) => p.id !== id));

  // Desvincular artigos que apontavam para este projeto
  const currentArticles = getStoredArticles();
  let articleChanged = false;
  const updatedArticles = currentArticles.map((a) => {
    if (a.relatedProjectId === id) {
      articleChanged = true;
      return { ...a, relatedProjectId: "" };
    }
    return a;
  });
  if (articleChanged) {
    saveArticles(updatedArticles);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Remove qualquer vínculo de foreign key antes de deletar o projeto
      await supabase.from("articles").update({ related_work_id: null }).eq("related_work_id", id);
      await supabase.from("blog_posts").update({ related_project_id: null }).eq("related_project_id", id);

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
      let { error } = await supabase.from("articles").upsert(payload, { onConflict: "id" });
      if (error && error.message && error.message.includes("violates foreign key constraint")) {
        console.warn("FK de related_work_id violada no artigo, limpando vínculo:", error.message);
        payload.related_work_id = null;
        const retry = await supabase.from("articles").upsert(payload, { onConflict: "id" });
        error = retry.error;
      }
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

  // Desvincular projetos que apontavam para este artigo
  const currentProjects = getStoredProjects();
  let projectChanged = false;
  const updatedProjects = currentProjects.map((p) => {
    if (p.relatedArticleId === id) {
      projectChanged = true;
      return { ...p, relatedArticleId: "" };
    }
    return p;
  });
  if (projectChanged) {
    saveProjects(updatedProjects);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Remove qualquer vínculo de foreign key antes de deletar o artigo
      await supabase.from("works").update({ related_article_id: null }).eq("related_article_id", id);
      await supabase.from("blog_posts").update({ related_article_id: null }).eq("related_article_id", id);

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
      const docsToSave = (config.googleDocsUrlEn && config.googleDocsUrlPt && config.googleDocsUrlEn !== config.googleDocsUrlPt)
        ? `${config.googleDocsUrlEn.trim()} ${BILINGUAL_SPLIT} ${config.googleDocsUrlPt.trim()}`
        : (config.googleDocsUrlEn || config.googleDocsUrl || "");

      const pdfToSave = (config.pdfUrlEn && config.pdfUrlPt && config.pdfUrlEn !== config.pdfUrlPt)
        ? `${config.pdfUrlEn.trim()} ${BILINGUAL_SPLIT} ${config.pdfUrlPt.trim()}`
        : (config.pdfUrlEn || config.pdfUrl || "");

      const { error } = await supabase.from("cv_configs").upsert(
        {
          id: "production",
          google_docs_url: docsToSave,
          pdf_url: pdfToSave,
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

/**
 * Faz upload do arquivo PDF do CV diretamente para o bucket "documents" do Supabase Storage.
 * Atualiza automaticamente a tabela cv_configs com a URL pública gerada para o idioma correspondente.
 */
export async function uploadCvPdf(file, lang = "en") {
  if (!file) throw new Error("Nenhum arquivo fornecido.");
  const isPdf = file.name?.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
  if (!isPdf) {
    throw new Error("Formato inválido. Apenas arquivos PDF (.pdf) são permitidos para o Currículo.");
  }

  const cleanLang = (lang === "pt" ? "pt" : "en");
  let publicUrl = null;
  let isCloud = false;

  if (isSupabaseConfigured && supabase) {
    const bucketsToTry = ["documents", "images"];
    for (const b of bucketsToTry) {
      try {
        const timestamp = Date.now();
        const cleanName = (file.name || `curriculo_${cleanLang}.pdf`).replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `cv/${timestamp}-${cleanLang}-${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from(b)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: "application/pdf"
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from(b)
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            publicUrl = publicUrlData.publicUrl;
            isCloud = true;
            break;
          }
        }
      } catch (err) {
        console.warn(`Upload PDF no bucket ${b} avisou:`, err.message);
      }
    }
  }

  // Se o upload para o Storage falhar (ex: bucket inexistente), converte para Data URL persistente
  if (!publicUrl) {
    publicUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  const currentConfig = getStoredCvConfig();
  const updatedConfig = {
    ...currentConfig,
    pdfUrl: publicUrl,
    [cleanLang === "pt" ? "pdfUrlPt" : "pdfUrlEn"]: publicUrl,
    updatedAt: new Date().toISOString().split("T")[0]
  };

  await persistCvConfig(updatedConfig);
  return { success: true, publicUrl, config: updatedConfig, cloud: isCloud, lang: cleanLang };
}

export async function persistDrawing(item) {
  const current = getStoredDrawings();
  const idx = current.findIndex((d) => d.id === item.id);
  let updatedList;
  if (idx >= 0) {
    updatedList = [...current];
    updatedList[idx] = item;
  } else {
    updatedList = [...current, item];
  }
  saveDrawings(updatedList);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = mapDrawingToDb(item);
      const { error } = await supabase.from("drawings").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao salvar desenho no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function removeDrawing(id) {
  const current = getStoredDrawings();
  saveDrawings(current.filter((d) => d.id !== id));

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("drawings").delete().eq("id", id);
      if (error) throw error;
      return { success: true, cloud: true };
    } catch (err) {
      console.error("Erro ao remover desenho no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function uploadDrawingImage(file) {
  if (!file) throw new Error("Nenhum arquivo de imagem fornecido.");

  if (isSupabaseConfigured && supabase) {
    try {
      const timestamp = Date.now();
      const cleanName = (file.name || "desenho.webp").replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `drawings/${timestamp}-${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type || "image/webp"
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return { success: true, publicUrl: publicUrlData.publicUrl, cloud: true };
        }
      } else {
        console.warn("Upload de desenho no Supabase Storage avisou:", uploadError.message);
      }
    } catch (err) {
      console.warn("Falha de rede ao subir imagem no Supabase Storage:", err);
    }
  }

  // Fallback em Base64 para funcionamento offline transparente
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ success: true, publicUrl: reader.result, cloud: false });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function uploadProfileImage(file) {
  if (!file) throw new Error("Nenhum arquivo de imagem fornecido.");

  if (isSupabaseConfigured && supabase) {
    const bucketsToTry = ["images", "documents"];
    for (const b of bucketsToTry) {
      try {
        const timestamp = Date.now();
        const cleanName = (file.name || "profile.webp").replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `avatars/${timestamp}-${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from(b)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type || "image/webp"
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from(b)
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            return { success: true, publicUrl: publicUrlData.publicUrl, cloud: true };
          }
        }
      } catch (err) {
        console.warn(`Upload foto de perfil no bucket ${b} avisou:`, err.message);
      }
    }
  }

  // Fallback em Base64 para funcionamento transparente
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ success: true, publicUrl: reader.result, cloud: false, fallback: true });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function fetchProfileConfig() {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Tenta tabela public.profile_configs
      const { data, error } = await supabase
        .from("profile_configs")
        .select("*")
        .eq("id", "production")
        .maybeSingle();

      if (!error && data?.photo_url) {
        const config = { photoUrl: data.photo_url, updatedAt: data.updated_at };
        saveProfileConfig(config);
        return config;
      }

      // 2. Fallback: tenta buscar de agent_configs
      const { data: agentData } = await supabase
        .from("agent_configs")
        .select("custom_hobby_json")
        .eq("id", "production")
        .maybeSingle();

      if (agentData?.custom_hobby_json?.profilePhoto) {
        const config = {
          photoUrl: agentData.custom_hobby_json.profilePhoto,
          updatedAt: agentData.custom_hobby_json.updatedAt || new Date().toISOString()
        };
        saveProfileConfig(config);
        return config;
      }
    } catch (err) {
      console.warn("Falha ao buscar profile config do Supabase:", err);
    }
  }
  return getStoredProfileConfig();
}

export async function persistProfileConfig(config) {
  saveProfileConfig(config);
  let isCloud = false;

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Tenta salvar na tabela public.profile_configs
      const { error: profErr } = await supabase.from("profile_configs").upsert(
        {
          id: "production",
          photo_url: config.photoUrl,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );

      if (!profErr) {
        isCloud = true;
      }

      // 2. Backup redundante em agent_configs
      try {
        const agentRes = await supabase
          .from("agent_configs")
          .select("custom_hobby_json")
          .eq("id", "production")
          .maybeSingle();
        const existing = agentRes.data?.custom_hobby_json || {};
        await supabase.from("agent_configs").upsert(
          {
            id: "production",
            custom_hobby_json: { ...existing, profilePhoto: config.photoUrl, updatedAt: new Date().toISOString() },
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );
        isCloud = true;
      } catch (e) {}

      return { success: true, cloud: isCloud };
    } catch (err) {
      console.warn("Erro ao salvar perfil no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function persistAgentConfig(
  systemPrompt,
  modelName = "qwen/qwen3.8-27b",
  temperature = 0.3,
  maxTokens = 800,
  groqApiKey = null
) {
  const cleanPrompt = cleanPromptFromKey(systemPrompt);
  localStorage.setItem("portfolio_agent_system_prompt", cleanPrompt);
  localStorage.setItem("portfolio_agent_model", modelName);

  if (isSupabaseConfigured && supabase) {
    try {
      const activeKey = (groqApiKey && typeof groqApiKey === "string" && groqApiKey.trim())
        ? groqApiKey.trim()
        : extractKeyFromPrompt(systemPrompt);

      // Embed tag inside prompt so key persists even if column doesn't exist yet
      const promptToStore = activeKey
        ? `<!-- AGENT_KEY: ${activeKey} -->\n${cleanPrompt}`
        : cleanPrompt;

      const payload = {
        id: "production",
        model_name: modelName,
        system_prompt: promptToStore,
        temperature: Number(temperature),
        max_tokens: Number(maxTokens),
        updated_at: new Date().toISOString()
      };
      if (activeKey) {
        payload.groq_api_key = activeKey;
      }

      let { error } = await supabase.from("agent_configs").upsert(
        payload,
        { onConflict: "id" }
      );

      // Se falhar porque a coluna groq_api_key ainda não existe no schema remoto, tenta sem ela mantendo o prompt com tag
      if (error && error.message && error.message.includes("groq_api_key")) {
        delete payload.groq_api_key;
        const retry = await supabase.from("agent_configs").upsert(
          payload,
          { onConflict: "id" }
        );
        error = retry.error;
      }

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
  } else if (type === "drawings") {
    saveDrawings(orderedItems);
    if (isSupabaseConfigured && supabase) {
      try {
        const updates = orderedItems.map((item, index) =>
          supabase
            .from("drawings")
            .update({ display_order: index })
            .eq("id", item.id)
        );
        await Promise.all(updates);
        return { success: true, cloud: true };
      } catch (err) {
        console.error("Erro ao ordenar desenhos no Supabase:", err);
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
