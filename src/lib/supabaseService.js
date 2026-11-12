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
  saveHobbies,
  getStoredProfileConfig,
  saveProfileConfig
} from "../data/projectsData.js";
import {
  getStoredBlogPosts,
  saveBlogPosts
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
  let titleEn = row.title_en || "";
  let titlePt = row.title_pt || "";
  if (row.title && row.title.includes(BILINGUAL_SPLIT)) {
    const parts = row.title.split(BILINGUAL_SPLIT);
    titleEn = parts[0].trim();
    titlePt = parts[1].trim();
  } else if (!titleEn && !titlePt && row.title) {
    titleEn = row.title;
    titlePt = row.title;
  }

  let shortDescEn = row.short_description_en || "";
  let shortDescPt = row.short_description_pt || "";
  if (row.short_description && row.short_description.includes(BILINGUAL_SPLIT)) {
    const parts = row.short_description.split(BILINGUAL_SPLIT);
    shortDescEn = parts[0].trim();
    shortDescPt = parts[1].trim();
  } else if (!shortDescEn && !shortDescPt && row.short_description) {
    shortDescEn = row.short_description;
    shortDescPt = row.short_description;
  }

  let aboutEn = row.about_context_en || "";
  let aboutPt = row.about_context_pt || "";
  if (row.about_context && row.about_context.includes(BILINGUAL_SPLIT)) {
    const parts = row.about_context.split(BILINGUAL_SPLIT);
    aboutEn = parts[0].trim();
    aboutPt = parts[1].trim();
  } else if (!aboutEn && !aboutPt && row.about_context) {
    aboutEn = row.about_context;
    aboutPt = row.about_context;
  }

  let contentEn = row.content_en || "";
  let contentPt = row.content_pt || "";
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
    contentEn: contentEn || row.content || "",
    contentPt: contentPt || row.content || "",
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
  let titleEn = row.title_en || "";
  let titlePt = row.title_pt || "";
  if (row.title && row.title.includes(BILINGUAL_SPLIT)) {
    const parts = row.title.split(BILINGUAL_SPLIT);
    titleEn = parts[0].trim();
    titlePt = parts[1].trim();
  } else if (!titleEn && !titlePt && row.title) {
    titleEn = row.title;
    titlePt = row.title;
  }

  let shortDescEn = row.short_description_en || "";
  let shortDescPt = row.short_description_pt || "";
  if (row.short_description && row.short_description.includes(BILINGUAL_SPLIT)) {
    const parts = row.short_description.split(BILINGUAL_SPLIT);
    shortDescEn = parts[0].trim();
    shortDescPt = parts[1].trim();
  } else if (!shortDescEn && !shortDescPt && row.short_description) {
    shortDescEn = row.short_description;
    shortDescPt = row.short_description;
  }

  let aboutEn = row.about_context_en || "";
  let aboutPt = row.about_context_pt || "";
  if (row.about_context && row.about_context.includes(BILINGUAL_SPLIT)) {
    const parts = row.about_context.split(BILINGUAL_SPLIT);
    aboutEn = parts[0].trim();
    aboutPt = parts[1].trim();
  } else if (!aboutEn && !aboutPt && row.about_context) {
    aboutEn = row.about_context;
    aboutPt = row.about_context;
  }

  let contentEn = row.content_en || "";
  let contentPt = row.content_pt || "";
  if (row.content && row.content.includes(BILINGUAL_SPLIT)) {
    const parts = row.content.split(BILINGUAL_SPLIT);
    contentEn = parts[0].trim();
    contentPt = parts[1].trim();
  } else if (!contentEn && !contentPt && row.content) {
    contentEn = row.content;
    contentPt = row.content;
  }

  let docsEn = row.google_docs_url_en || "";
  let docsPt = row.google_docs_url_pt || "";
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
    contentEn: contentEn || row.content || "",
    contentPt: contentPt || row.content || "",
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
  let descEn = "";
  let descPt = "";
  if (row.description && row.description.includes(BILINGUAL_SPLIT)) {
    const parts = row.description.split(BILINGUAL_SPLIT);
    descEn = parts[0].trim();
    descPt = parts[1].trim();
  } else if (row.description) {
    descEn = row.description;
    descPt = row.description;
  }

  let titleEn = row.title || "";
  let titlePt = row.title || "";
  if (row.title && row.title.includes(BILINGUAL_SPLIT)) {
    const parts = row.title.split(BILINGUAL_SPLIT);
    titleEn = parts[0].trim();
    titlePt = parts[1].trim();
  }

  return {
    id: row.id,
    title: row.title,
    titleEn: row.title_en || titleEn || row.title,
    titlePt: row.title_pt || titlePt || row.title,
    src: row.image_url || row.src || "",
    description: descEn || row.description || "",
    descriptionEn: descEn || row.description || "",
    descriptionPt: descPt || row.description || "",
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
        .select("id, model_name, system_prompt, max_tokens, temperature, updated_at")
        .eq("id", "production")
        .maybeSingle();

      if (!error && data) {
        return {
          modelName: data.model_name,
          systemPrompt: cleanPromptFromKey(data.system_prompt),
          rawSystemPrompt: data.system_prompt,
          maxTokens: data.max_tokens,
          temperature: data.temperature,
          hasApiKey: true,
          groqApiKey: ""
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
        .update({
          custom_hobby_json: hobbyData,
          updated_at: new Date().toISOString()
        })
        .eq("id", "production");
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
          .update({
            custom_hobby_json: payload,
            updated_at: new Date().toISOString()
          })
          .eq("id", "production");
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
          .update({
            system_prompt: updatedPrompt,
            updated_at: new Date().toISOString()
          })
          .eq("id", "production");
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
        await supabase.from("agent_configs").update({
          custom_hobby_json: { hobbiesList: updated, updatedAt: new Date().toISOString() },
          updated_at: new Date().toISOString()
        }).eq("id", "production");
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

      const tryJson = await supabase.from("agent_configs").update(
        { custom_hobby_json: mergedConfig, updated_at: new Date().toISOString() }
      ).eq("id", "production");
      if (!tryJson.error) return { success: true, cloud: true };

      // Fallback em system_prompt
      const basePrompt = configRes.data?.system_prompt || "";
      const updatedPrompt = embedMetadataInPrompt(basePrompt, "BLOG_POSTS", posts);
      const tryPrompt = await supabase.from("agent_configs").update(
        { system_prompt: updatedPrompt, updated_at: new Date().toISOString() }
      ).eq("id", "production");
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
  topBadgeEn: "Matheus de Castro Ecosystem"
};

export function normalizeBlogGatewayConfig(config) {
  if (!config || typeof config !== "object") return DEFAULT_BLOG_GATEWAY_CONFIG;
  const gwTitlePt = config.gatewayTitlePt || config.mainTitlePt || DEFAULT_BLOG_GATEWAY_CONFIG.gatewayTitlePt;
  const gwTitleEn = config.gatewayTitleEn || config.mainTitleEn || DEFAULT_BLOG_GATEWAY_CONFIG.gatewayTitleEn;
  const gwSubtitlePt = config.gatewaySubtitlePt || config.subtitlePt || DEFAULT_BLOG_GATEWAY_CONFIG.gatewaySubtitlePt;
  const gwSubtitleEn = config.gatewaySubtitleEn || config.subtitleEn || DEFAULT_BLOG_GATEWAY_CONFIG.gatewaySubtitleEn;
  const topBadgePt = config.topBadgePt || DEFAULT_BLOG_GATEWAY_CONFIG.topBadgePt;
  const topBadgeEn = config.topBadgeEn || DEFAULT_BLOG_GATEWAY_CONFIG.topBadgeEn;
  const isWipVisible = config.wipNoticeVisible !== false && config.showBanner !== false;
  const wipBadgePt = config.wipNoticeBadgePt || config.bannerBadgePt || DEFAULT_BLOG_GATEWAY_CONFIG.wipNoticeBadgePt;
  const wipBadgeEn = config.wipNoticeBadgeEn || config.bannerBadgeEn || DEFAULT_BLOG_GATEWAY_CONFIG.wipNoticeBadgeEn;
  const wipTextPt = config.wipNoticeTextPt || config.bannerTextPt || DEFAULT_BLOG_GATEWAY_CONFIG.wipNoticeTextPt;
  const wipTextEn = config.wipNoticeTextEn || config.bannerTextEn || DEFAULT_BLOG_GATEWAY_CONFIG.wipNoticeTextEn;

  const cardTechBadgePt = config.cardTechBadgePt || config.card1BadgePt || DEFAULT_BLOG_GATEWAY_CONFIG.cardTechBadgePt;
  const cardTechBadgeEn = config.cardTechBadgeEn || config.card1BadgeEn || DEFAULT_BLOG_GATEWAY_CONFIG.cardTechBadgeEn;
  const cardTechTitlePt = config.cardTechTitlePt || config.card1TitlePt || DEFAULT_BLOG_GATEWAY_CONFIG.cardTechTitlePt;
  const cardTechTitleEn = config.cardTechTitleEn || config.card1TitleEn || DEFAULT_BLOG_GATEWAY_CONFIG.cardTechTitleEn;
  const cardTechDescPt = config.cardTechDescPt || config.card1DescPt || DEFAULT_BLOG_GATEWAY_CONFIG.cardTechDescPt;
  const cardTechDescEn = config.cardTechDescEn || config.card1DescEn || DEFAULT_BLOG_GATEWAY_CONFIG.cardTechDescEn;
  const cardTechTags = (Array.isArray(config.cardTechTags) && config.cardTechTags.length > 0)
    ? config.cardTechTags
    : ((Array.isArray(config.card1Tags) && config.card1Tags.length > 0) ? config.card1Tags : DEFAULT_BLOG_GATEWAY_CONFIG.cardTechTags);
  const cardTechBtnPt = config.cardTechBtnPt || config.card1BtnPt || DEFAULT_BLOG_GATEWAY_CONFIG.cardTechBtnPt;
  const cardTechBtnEn = config.cardTechBtnEn || config.card1BtnEn || DEFAULT_BLOG_GATEWAY_CONFIG.cardTechBtnEn;

  const cardAlomyrBadgePt = config.cardAlomyrBadgePt || config.card2BadgePt || DEFAULT_BLOG_GATEWAY_CONFIG.cardAlomyrBadgePt;
  const cardAlomyrBadgeEn = config.cardAlomyrBadgeEn || config.card2BadgeEn || DEFAULT_BLOG_GATEWAY_CONFIG.cardAlomyrBadgeEn;
  const cardAlomyrTitlePt = config.cardAlomyrTitlePt || config.card2TitlePt || DEFAULT_BLOG_GATEWAY_CONFIG.cardAlomyrTitlePt;
  const cardAlomyrTitleEn = config.cardAlomyrTitleEn || config.card2TitleEn || DEFAULT_BLOG_GATEWAY_CONFIG.cardAlomyrTitleEn;
  const cardAlomyrDescPt = config.cardAlomyrDescPt || config.card2DescPt || DEFAULT_BLOG_GATEWAY_CONFIG.cardAlomyrDescPt;
  const cardAlomyrDescEn = config.cardAlomyrDescEn || config.card2DescEn || DEFAULT_BLOG_GATEWAY_CONFIG.cardAlomyrDescEn;
  const cardAlomyrTags = (Array.isArray(config.cardAlomyrTags) && config.cardAlomyrTags.length > 0)
    ? config.cardAlomyrTags
    : ((Array.isArray(config.card2Tags) && config.card2Tags.length > 0) ? config.card2Tags : DEFAULT_BLOG_GATEWAY_CONFIG.cardAlomyrTags);
  const cardAlomyrBtnPt = config.cardAlomyrBtnPt || config.card2BtnPt || DEFAULT_BLOG_GATEWAY_CONFIG.cardAlomyrBtnPt;
  const cardAlomyrBtnEn = config.cardAlomyrBtnEn || config.card2BtnEn || DEFAULT_BLOG_GATEWAY_CONFIG.cardAlomyrBtnEn;

  const footerNotePt = config.footerNotePt || DEFAULT_BLOG_GATEWAY_CONFIG.footerNotePt;
  const footerNoteEn = config.footerNoteEn || DEFAULT_BLOG_GATEWAY_CONFIG.footerNoteEn;
  const defaultRoute = config.defaultRoute || DEFAULT_BLOG_GATEWAY_CONFIG.defaultRoute;

  return {
    ...DEFAULT_BLOG_GATEWAY_CONFIG,
    ...config,
    gatewayTitlePt: gwTitlePt,
    gatewayTitleEn: gwTitleEn,
    mainTitlePt: gwTitlePt,
    mainTitleEn: gwTitleEn,
    gatewaySubtitlePt: gwSubtitlePt,
    gatewaySubtitleEn: gwSubtitleEn,
    subtitlePt: gwSubtitlePt,
    subtitleEn: gwSubtitleEn,
    topBadgePt,
    topBadgeEn,
    wipNoticeVisible: isWipVisible,
    showBanner: isWipVisible,
    wipNoticeBadgePt: wipBadgePt,
    wipNoticeBadgeEn: wipBadgeEn,
    bannerBadgePt: wipBadgePt,
    bannerBadgeEn: wipBadgeEn,
    wipNoticeTextPt: wipTextPt,
    wipNoticeTextEn: wipTextEn,
    bannerTextPt: wipTextPt,
    bannerTextEn: wipTextEn,
    cardTechBadgePt,
    cardTechBadgeEn,
    card1BadgePt: cardTechBadgePt,
    card1BadgeEn: cardTechBadgeEn,
    cardTechTitlePt,
    cardTechTitleEn,
    card1TitlePt: cardTechTitlePt,
    card1TitleEn: cardTechTitleEn,
    cardTechDescPt,
    cardTechDescEn,
    card1DescPt: cardTechDescPt,
    card1DescEn: cardTechDescEn,
    cardTechTags,
    card1Tags: cardTechTags,
    cardTechBtnPt,
    cardTechBtnEn,
    card1BtnPt: cardTechBtnPt,
    card1BtnEn: cardTechBtnEn,
    cardAlomyrBadgePt,
    cardAlomyrBadgeEn,
    card2BadgePt: cardAlomyrBadgePt,
    card2BadgeEn: cardAlomyrBadgeEn,
    cardAlomyrTitlePt,
    cardAlomyrTitleEn,
    card2TitlePt: cardAlomyrTitlePt,
    card2TitleEn: cardAlomyrTitleEn,
    cardAlomyrDescPt,
    cardAlomyrDescEn,
    card2DescPt: cardAlomyrDescPt,
    card2DescEn: cardAlomyrDescEn,
    cardAlomyrTags,
    card2Tags: cardAlomyrTags,
    cardAlomyrBtnPt,
    cardAlomyrBtnEn,
    card2BtnPt: cardAlomyrBtnPt,
    card2BtnEn: cardAlomyrBtnEn,
    footerNotePt,
    footerNoteEn,
    defaultRoute,
    updatedAt: config.updatedAt || new Date().toISOString()
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

      let candidateCol = null;
      let candidatePrompt = null;

      if (!error && data?.blog_gateway_config) {
        candidateCol = normalizeBlogGatewayConfig(data.blog_gateway_config);
      }

      if (data?.system_prompt) {
        const meta = extractMetadataFromPrompt(data.system_prompt, "GATEWAY_CONFIG");
        if (meta) {
          candidatePrompt = normalizeBlogGatewayConfig(meta);
        }
      }

      let best = candidateCol;
      if (candidatePrompt) {
        if (!best) {
          best = candidatePrompt;
        } else if (candidatePrompt.updatedAt && (!best.updatedAt || new Date(candidatePrompt.updatedAt) > new Date(best.updatedAt))) {
          best = candidatePrompt;
        }
      }

      if (best) {
        saveBlogGatewayConfig(best);
        return best;
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
      // 1. UPDATE direto na coluna dedicada
      const { error: updateErr } = await supabase
        .from("agent_configs")
        .update({
          blog_gateway_config: normalized,
          updated_at: new Date().toISOString()
        })
        .eq("id", "production");

      // 2. Redundância no system_prompt
      try {
        const agentRes = await supabase
          .from("agent_configs")
          .select("system_prompt")
          .eq("id", "production")
          .maybeSingle();

        const basePrompt = agentRes.data?.system_prompt || "";
        const updatedPrompt = embedMetadataInPrompt(basePrompt, "GATEWAY_CONFIG", normalized);

        await supabase
          .from("agent_configs")
          .update({
            system_prompt: updatedPrompt,
            updated_at: new Date().toISOString()
          })
          .eq("id", "production");
      } catch (promptErr) {
        console.warn("Redundância em prompt de gateway:", promptErr);
      }

      if (!updateErr) return { success: true, cloud: true };
      return { success: true, cloud: true };
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
  statusCode: "404",
  badgePt: "Rota Não Encontrada",
  badgeEn: "Route Not Found",
  titlePt: "Você caiu em um vácuo cósmico",
  titleEn: "Lost in the cosmic void",
  subtitlePt: "A página ou recurso que você tentou acessar não existe, foi movida ou está temporariamente offline. Mas não se preocupe, nosso assistente Alomyr está a postos para te guiar!",
  subtitleEn: "The page or resource you requested doesn't exist, was relocated, or is temporarily offline. But don't worry, Alomyr is ready to guide you back!",
  mascotImage: "/wolf(2).png",
  backHomeTextPt: "Voltar para o Início",
  backHomeTextEn: "Back to Home",
  buttonHomePt: "Voltar para o Início",
  buttonHomeEn: "Back to Home",
  askAlomyrTextPt: "Perguntar ao Alomyr 💬",
  askAlomyrTextEn: "Ask Alomyr 💬",
  buttonAskAlomyrPt: "Perguntar ao Alomyr 💬",
  buttonAskAlomyrEn: "Ask Alomyr 💬",
  exploreWorksTextPt: "Ver Projetos & Artigos",
  exploreWorksTextEn: "Explore Projects & Papers",
  buttonProjectsPt: "Ver Projetos & Artigos",
  buttonProjectsEn: "Explore Projects & Papers",
  alomyrPromptPt: "Olá Alomyr! Me perdi em uma rota inexistente (404). Quais são os principais projetos do Matheus e como navego pelo portfólio?",
  alomyrPromptEn: "Hi Alomyr! I got lost on a 404 page. What are Matheus's main projects and how do I navigate the portfolio?",
  askAlomyrPromptPt: "Olá Alomyr! Me perdi em uma rota inexistente (404). Quais são os principais projetos do Matheus e como navego pelo portfólio?",
  askAlomyrPromptEn: "Hi Alomyr! I got lost on a 404 page. What are Matheus's main projects and how do I navigate the portfolio?",
  updatedAt: "2026-11-11"
};

export function normalizeNotFoundConfig(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_NOTFOUND_CONFIG };

  const errorCode = raw.errorCode || raw.statusCode || DEFAULT_NOTFOUND_CONFIG.errorCode;
  const backHomePt = raw.buttonHomePt || raw.backHomeTextPt || DEFAULT_NOTFOUND_CONFIG.backHomeTextPt;
  const backHomeEn = raw.buttonHomeEn || raw.backHomeTextEn || DEFAULT_NOTFOUND_CONFIG.backHomeTextEn;
  const askPt = raw.buttonAskAlomyrPt || raw.askAlomyrTextPt || DEFAULT_NOTFOUND_CONFIG.askAlomyrTextPt;
  const askEn = raw.buttonAskAlomyrEn || raw.askAlomyrTextEn || DEFAULT_NOTFOUND_CONFIG.askAlomyrTextEn;
  const explorePt = raw.buttonProjectsPt || raw.exploreWorksTextPt || DEFAULT_NOTFOUND_CONFIG.exploreWorksTextPt;
  const exploreEn = raw.buttonProjectsEn || raw.exploreWorksTextEn || DEFAULT_NOTFOUND_CONFIG.exploreWorksTextEn;
  const promptPt = raw.askAlomyrPromptPt || raw.alomyrPromptPt || DEFAULT_NOTFOUND_CONFIG.alomyrPromptPt;
  const promptEn = raw.askAlomyrPromptEn || raw.alomyrPromptEn || DEFAULT_NOTFOUND_CONFIG.alomyrPromptEn;

  return {
    ...DEFAULT_NOTFOUND_CONFIG,
    ...raw,
    errorCode,
    statusCode: errorCode,
    badgePt: raw.badgePt || DEFAULT_NOTFOUND_CONFIG.badgePt,
    badgeEn: raw.badgeEn || DEFAULT_NOTFOUND_CONFIG.badgeEn,
    titlePt: raw.titlePt || DEFAULT_NOTFOUND_CONFIG.titlePt,
    titleEn: raw.titleEn || DEFAULT_NOTFOUND_CONFIG.titleEn,
    subtitlePt: raw.subtitlePt || DEFAULT_NOTFOUND_CONFIG.subtitlePt,
    subtitleEn: raw.subtitleEn || DEFAULT_NOTFOUND_CONFIG.subtitleEn,
    mascotImage: (typeof raw.mascotImage === "string" && raw.mascotImage.trim()) ? raw.mascotImage.trim() : DEFAULT_NOTFOUND_CONFIG.mascotImage,
    backHomeTextPt: backHomePt,
    backHomeTextEn: backHomeEn,
    buttonHomePt: backHomePt,
    buttonHomeEn: backHomeEn,
    askAlomyrTextPt: askPt,
    askAlomyrTextEn: askEn,
    buttonAskAlomyrPt: askPt,
    buttonAskAlomyrEn: askEn,
    exploreWorksTextPt: explorePt,
    exploreWorksTextEn: exploreEn,
    buttonProjectsPt: explorePt,
    buttonProjectsEn: exploreEn,
    alomyrPromptPt: promptPt,
    alomyrPromptEn: promptEn,
    askAlomyrPromptPt: promptPt,
    askAlomyrPromptEn: promptEn,
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
}

export function getStoredNotFoundConfig() {
  try {
    const raw = localStorage.getItem("portfolio_notfound_config");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return normalizeNotFoundConfig(parsed);
      }
    }
  } catch (e) {
    console.warn("Falha ao ler configuracao de 404:", e);
  }
  return DEFAULT_NOTFOUND_CONFIG;
}

export function saveNotFoundConfig(config) {
  try {
    const normalized = normalizeNotFoundConfig(config);
    localStorage.setItem("portfolio_notfound_config", JSON.stringify(normalized));
  } catch (e) {
    console.error("Erro ao salvar configuracao de 404:", e);
  }
}

export async function fetchNotFoundConfig() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("agent_configs")
        .select("notfound_config, system_prompt")
        .eq("id", "production")
        .maybeSingle();

      let candidateCol = null;
      let candidatePrompt = null;

      if (!error && data?.notfound_config) {
        candidateCol = normalizeNotFoundConfig(data.notfound_config);
      }

      if (data?.system_prompt) {
        const meta = extractMetadataFromPrompt(data.system_prompt, "NOTFOUND_CONFIG");
        if (meta) {
          candidatePrompt = normalizeNotFoundConfig(meta);
        }
      }

      let best = candidateCol;
      if (candidatePrompt) {
        if (!best) {
          best = candidatePrompt;
        } else if (candidatePrompt.updatedAt && (!best.updatedAt || new Date(candidatePrompt.updatedAt) > new Date(best.updatedAt))) {
          best = candidatePrompt;
        }
      }

      if (best) {
        saveNotFoundConfig(best);
        return best;
      }
    } catch (err) {
      console.warn("Falha ao buscar notfound_config do Supabase:", err);
    }
  }
  return getStoredNotFoundConfig();
}

export async function persistNotFoundConfig(config) {
  const normalized = normalizeNotFoundConfig(config);
  saveNotFoundConfig(normalized);
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. UPDATE direto na coluna dedicada
      const { error: updateErr } = await supabase
        .from("agent_configs")
        .update({
          notfound_config: normalized,
          updated_at: new Date().toISOString()
        })
        .eq("id", "production");

      // 2. Redundância no system_prompt
      try {
        const agentRes = await supabase
          .from("agent_configs")
          .select("system_prompt")
          .eq("id", "production")
          .maybeSingle();

        const basePrompt = agentRes.data?.system_prompt || "";
        const updatedPrompt = embedMetadataInPrompt(basePrompt, "NOTFOUND_CONFIG", normalized);

        await supabase
          .from("agent_configs")
          .update({
            system_prompt: updatedPrompt,
            updated_at: new Date().toISOString()
          })
          .eq("id", "production");
      } catch (promptErr) {
        console.warn("Redundância em prompt de notfound:", promptErr);
      }

      if (!updateErr) return { success: true, cloud: true };
      return { success: true, cloud: true };
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
        await supabase.from("agent_configs").update({
          custom_hobby_json: { ...existing, profilePhoto: config.photoUrl, updatedAt: new Date().toISOString() },
          updated_at: new Date().toISOString()
        }).eq("id", "production");
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
  _groqApiKey = null
) {
  const cleanPrompt = cleanPromptFromKey(systemPrompt);
  localStorage.setItem("portfolio_agent_system_prompt", cleanPrompt);
  localStorage.setItem("portfolio_agent_model", modelName);

  if (isSupabaseConfigured && supabase) {
    try {
      // Preserva tags de metadados existentes no system_prompt (404, gateway, hobbies, posts)
      let metaBlock = "";
      try {
        const agentRes = await supabase.from("agent_configs").select("system_prompt").eq("id", "production").maybeSingle();
        const existingPrompt = agentRes.data?.system_prompt || "";
        const tags = [];
        ["NOTFOUND_CONFIG", "GATEWAY_CONFIG", "HOBBIES_LIST", "BLOG_POSTS"].forEach((t) => {
          const match = existingPrompt.match(new RegExp(`<!-- ${t}: ([\\s\\S]*?) -->`));
          if (match) tags.push(match[0]);
        });
        if (tags.length > 0) metaBlock = tags.join("\n") + "\n";
      } catch (_) {}

      // Segurança: Chaves secretas nunca são concatenadas em texto plano no prompt público
      const promptToStore = metaBlock + cleanPrompt;

      const payload = {
        id: "production",
        model_name: modelName,
        system_prompt: promptToStore,
        temperature: Number(temperature),
        max_tokens: Number(maxTokens),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from("agent_configs").upsert(
        payload,
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
