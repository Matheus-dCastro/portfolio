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
  saveCvConfig,
  getStoredDrawings,
  saveDrawings,
  getStoredCustomHobby,
  saveCustomHobby,
  getStoredHobbies,
  saveHobbies
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
  const titleToSave = (item.titleEn && item.titlePt && item.titleEn !== item.titlePt)
    ? `${item.titleEn.trim()} ${BILINGUAL_SPLIT} ${item.titlePt.trim()}`
    : (item.titleEn || item.title || "");

  const shortDescToSave = (item.shortDescriptionEn && item.shortDescriptionPt && item.shortDescriptionEn !== item.shortDescriptionPt)
    ? `${item.shortDescriptionEn.trim()} ${BILINGUAL_SPLIT} ${item.shortDescriptionPt.trim()}`
    : (item.shortDescriptionEn || item.shortDescription || "");

  const aboutToSave = (item.aboutContextEn && item.aboutContextPt && item.aboutContextEn !== item.aboutContextPt)
    ? `${item.aboutContextEn.trim()} ${BILINGUAL_SPLIT} ${item.aboutContextPt.trim()}`
    : (item.aboutContextEn || item.aboutContext || "");

  const contentToSave = (item.contentEn && item.contentPt && item.contentEn !== item.contentPt)
    ? `${item.contentEn.trim()}\n\n${BILINGUAL_SPLIT}\n\n${item.contentPt.trim()}`
    : (item.contentEn || item.content || "");

  return {
    id: item.id,
    title: titleToSave,
    category: item.category || "Profissional",
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
    related_article_id: item.relatedArticleId ? item.relatedArticleId : null,
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
  const titleToSave = (item.titleEn && item.titlePt && item.titleEn !== item.titlePt)
    ? `${item.titleEn.trim()} ${BILINGUAL_SPLIT} ${item.titlePt.trim()}`
    : (item.titleEn || item.title || "");

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

  return {
    id: item.id,
    title: titleToSave,
    category: item.category || "Acadêmico",
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
    related_work_id: item.relatedProjectId ? item.relatedProjectId : null,
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
    src: row.src,
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
    title: item.titleEn || item.title,
    src: item.src,
    description: item.descriptionEn || item.description || "",
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
      if (!error && Array.isArray(data)) {
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
          temperature: data.temperature,
          hasApiKey: Boolean(data.groq_api_key),
          groqApiKey: data.groq_api_key || ""
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

export async function fetchHobbies() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("agent_configs")
        .select("custom_hobby_json")
        .eq("id", "production")
        .maybeSingle();

      if (!error && data?.custom_hobby_json) {
        if (Array.isArray(data.custom_hobby_json)) {
          saveHobbies(data.custom_hobby_json);
          return data.custom_hobby_json;
        } else if (data.custom_hobby_json?.hobbiesList && Array.isArray(data.custom_hobby_json.hobbiesList)) {
          saveHobbies(data.custom_hobby_json.hobbiesList);
          return data.custom_hobby_json.hobbiesList;
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
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        hobbiesList,
        updatedAt: new Date().toISOString()
      };
      const { error } = await supabase
        .from("agent_configs")
        .upsert(
          {
            id: "production",
            custom_hobby_json: payload,
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
      console.error("Erro ao persistir hobbies no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
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
    author: row.author || "Matheus de Castro",
    publishedAt: row.published_at || new Date().toISOString().split("T")[0],
    readTime: row.read_time || "5 min",
    displayOrder: typeof row.display_order === "number" ? row.display_order : 0,
    isPublished: row.is_published !== false
  };
}

export function mapBlogPostToDb(post) {
  return {
    id: post.id,
    channel: post.channel || "tech",
    title_pt: post.titlePt || "",
    title_en: post.titleEn || "",
    summary_pt: post.summaryPt || "",
    summary_en: post.summaryEn || "",
    category: post.category || "Geral",
    tags: Array.isArray(post.tags) ? post.tags : [],
    cover_image: post.coverImage || "",
    youtube_url: post.youtubeUrl || "",
    gallery_images: Array.isArray(post.galleryImages) ? post.galleryImages : [],
    content_pt: post.contentPt || "",
    content_en: post.contentEn || "",
    related_project_id: post.relatedProjectId || null,
    author: post.author || "Matheus de Castro",
    published_at: post.publishedAt || new Date().toISOString().split("T")[0],
    read_time: post.readTime || "5 min",
    display_order: typeof post.displayOrder === "number" ? post.displayOrder : 0,
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
        .select("custom_hobby_json")
        .eq("id", "production")
        .maybeSingle();

      if (!configErr && configData?.custom_hobby_json?.blogPosts && Array.isArray(configData.custom_hobby_json.blogPosts)) {
        saveBlogPosts(configData.custom_hobby_json.blogPosts);
        return configData.custom_hobby_json.blogPosts;
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
        return { success: true, cloud: true };
      }

      const configRes = await supabase
        .from("agent_configs")
        .select("custom_hobby_json")
        .eq("id", "production")
        .maybeSingle();

      const existingConfig = configRes.data?.custom_hobby_json || {};
      const mergedConfig = {
        ...existingConfig,
        blogPosts: updatedList,
        updatedAt: new Date().toISOString()
      };

      await supabase.from("agent_configs").upsert(
        { id: "production", custom_hobby_json: mergedConfig, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
      return { success: true, cloud: true };
    } catch (err) {
      console.warn("Erro ao persistir post no Supabase (mantido em local):", err);
      return { success: true, cloud: false, error: err.message };
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
        .select("custom_hobby_json")
        .eq("id", "production")
        .maybeSingle();

      const existingConfig = configRes.data?.custom_hobby_json || {};
      const mergedConfig = {
        ...existingConfig,
        blogPosts: posts,
        updatedAt: new Date().toISOString()
      };

      await supabase.from("agent_configs").upsert(
        { id: "production", custom_hobby_json: mergedConfig, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
      return { success: true, cloud: true };
    } catch (err) {
      console.warn("Erro ao salvar batch de posts do blog:", err);
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
      if (error && error.message && error.message.includes("does not exist")) {
        await persistBlogPostsBatch(updated);
      }
      return { success: true, cloud: true };
    } catch (err) {
      console.warn("Erro ao excluir post no Supabase:", err);
      return { success: true, cloud: false, error: err.message };
    }
  }
  return { success: true, cloud: false };
}

export async function uploadBlogImage(file) {
  if (!file) throw new Error("Nenhum arquivo de imagem fornecido.");

  if (isSupabaseConfigured && supabase) {
    try {
      const timestamp = Date.now();
      const cleanName = (file.name || "post_img.webp").replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = `blog/${timestamp}-${cleanName}`;

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
      }
    } catch (err) {
      console.warn("Falha de rede ao subir imagem de blog no Supabase Storage:", err);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve({ success: true, publicUrl: e.target.result, cloud: false });
    reader.onerror = () => reject(new Error("Erro ao ler imagem localmente"));
    reader.readAsDataURL(file);
  });
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

  if (isSupabaseConfigured && supabase) {
    const timestamp = Date.now();
    const cleanName = (file.name || `curriculo_${cleanLang}.pdf`).replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `cv/${timestamp}-${cleanLang}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: "application/pdf"
      });

    if (uploadError) {
      console.error("Erro no upload do PDF para o Supabase Storage:", uploadError);
      throw new Error(`Falha no Supabase Storage: ${uploadError.message || "Certifique-se de que o bucket 'documents' está criado no Supabase."}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) {
      throw new Error("Arquivo enviado, mas não foi possível obter a URL pública no Supabase.");
    }

    const currentConfig = getStoredCvConfig();
    const updatedConfig = {
      ...currentConfig,
      pdfUrl: publicUrl,
      [cleanLang === "pt" ? "pdfUrlPt" : "pdfUrlEn"]: publicUrl,
      updatedAt: new Date().toISOString().split("T")[0]
    };

    await persistCvConfig(updatedConfig);
    return { success: true, publicUrl, config: updatedConfig, cloud: true, lang: cleanLang };
  } else {
    const localUrl = URL.createObjectURL(file);
    const currentConfig = getStoredCvConfig();
    const updatedConfig = {
      ...currentConfig,
      pdfUrl: localUrl,
      [cleanLang === "pt" ? "pdfUrlPt" : "pdfUrlEn"]: localUrl,
      updatedAt: new Date().toISOString().split("T")[0]
    };
    saveCvConfig(updatedConfig);
    return { success: true, publicUrl: localUrl, config: updatedConfig, cloud: false, lang: cleanLang };
  }
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

export async function persistAgentConfig(
  systemPrompt,
  modelName = "qwen-2.5-coder-32b",
  temperature = 0.3,
  maxTokens = 800,
  groqApiKey = null
) {
  localStorage.setItem("portfolio_agent_system_prompt", systemPrompt);
  localStorage.setItem("portfolio_agent_model", modelName);

  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        id: "production",
        model_name: modelName,
        system_prompt: systemPrompt,
        temperature: Number(temperature),
        max_tokens: Number(maxTokens),
        updated_at: new Date().toISOString()
      };
      if (groqApiKey && typeof groqApiKey === "string" && groqApiKey.trim()) {
        payload.groq_api_key = groqApiKey.trim();
      }

      let { error } = await supabase.from("agent_configs").upsert(
        payload,
        { onConflict: "id" }
      );

      // Se falhar porque a coluna groq_api_key ainda não existe no schema remoto, tenta sem ela
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
