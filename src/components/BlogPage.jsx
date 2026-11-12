// src/components/BlogPage.jsx
// Dual-Blog Channel Page (Handles both /blog and /blog/alomyr with full reading view)

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../context/useLanguage";
import LanguageSwitcher from "./LanguageSwitcher";
import ShareButton from "./ShareButton";
import {
  fetchBlogPosts,
  fetchProfileConfig
} from "../lib/supabaseService";
import {
  getStoredBlogPosts,
  getYoutubeEmbedUrl
} from "../data/blogData";
import { getStoredProjects, getStoredArticles, getStoredProfileConfig } from "../data/projectsData";
import fotoAlomyr from "../assets/img/alomyr.jpeg";
import "./BlogPage.css";

export default function BlogPage({
  channel = "tech",
  initialPostId = null,
  onBackToHome,
  onNavigateToGateway,
  onSwitchChannel,
  onOpenProject
}) {
  const { t, lang } = useLanguage();
  const [activeChannel, setActiveChannel] = useState(channel);
  const [posts, setPosts] = useState(() => getStoredBlogPosts());
  const [selectedPostId, setSelectedPostId] = useState(initialPostId);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxImg, setLightboxImg] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(() => getStoredProfileConfig()?.photoUrl || fotoAlomyr);
  const [readProgress, setReadProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Monitor scroll for reading progress and back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = window.scrollY;
        setReadProgress(Math.min(100, Math.max(0, (current / totalHeight) * 100)));
        setShowBackToTop(current > 420);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync props
  useEffect(() => {
    setActiveChannel(channel);
  }, [channel]);

  useEffect(() => {
    if (initialPostId) {
      setSelectedPostId(initialPostId);
    }
  }, [initialPostId]);

  // Load from Supabase on mount
  useEffect(() => {
    fetchBlogPosts().then((loaded) => {
      if (Array.isArray(loaded) && loaded.length > 0) {
        setPosts(loaded);
      }
    });
    fetchProfileConfig().then((cfg) => {
      if (cfg?.photoUrl) setProfilePhoto(cfg.photoUrl);
    });
  }, []);

  // Update browser URL without reload (History API)
  const updateUrl = (chan, postId) => {
    try {
      const base = chan === "alomyr" ? "/blog/alomyr" : "/blog";
      const query = postId ? `?post=${encodeURIComponent(postId)}` : "";
      window.history.pushState({}, "", `${base}${query}`);
    } catch {
      // Ignore in non-standard environments
    }
  };

  const handleSelectPost = (post) => {
    setSelectedPostId(post ? post.id : null);
    updateUrl(activeChannel, post ? post.id : null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSwitchChannel = (newChan) => {
    setActiveChannel(newChan);
    setSelectedPostId(null);
    setSelectedTag(null);
    setSearchQuery("");
    updateUrl(newChan, null);
    if (onSwitchChannel) onSwitchChannel(newChan);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter posts by channel and publication status
  const channelPosts = useMemo(() => {
    return posts.filter(
      (p) => (p.channel || "tech") === activeChannel && p.isPublished !== false
    );
  }, [posts, activeChannel]);

  // Extract all distinct tags for current channel
  const availableTags = useMemo(() => {
    const set = new Set();
    channelPosts.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((tag) => set.add(tag.trim()));
      }
    });
    return Array.from(set);
  }, [channelPosts]);

  // Filtered posts based on search & tag
  const filteredPosts = useMemo(() => {
    let result = channelPosts;

    if (selectedTag) {
      result = result.filter(
        (p) => Array.isArray(p.tags) && p.tags.includes(selectedTag)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const title = (lang === "en" ? p.titleEn : p.titlePt) || p.titlePt || "";
        const summary = (lang === "en" ? p.summaryEn : p.summaryPt) || p.summaryPt || "";
        const content = (lang === "en" ? p.contentEn : p.contentPt) || p.contentPt || "";
        const tags = (p.tags || []).join(" ");
        const category = p.category || "";
        return (
          title.toLowerCase().includes(q) ||
          summary.toLowerCase().includes(q) ||
          content.toLowerCase().includes(q) ||
          tags.toLowerCase().includes(q) ||
          category.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [channelPosts, selectedTag, searchQuery, lang]);

  // Ei Nerd Portal Architecture: Lead Story (Destaque Principal) & Secondary Editorial Feed
  const isBrowsingAll = !searchQuery.trim() && !selectedTag;
  const featuredPost = useMemo(() => {
    if (!isBrowsingAll || filteredPosts.length === 0) return null;
    return filteredPosts[0];
  }, [isBrowsingAll, filteredPosts]);

  const regularPosts = useMemo(() => {
    if (!isBrowsingAll) return filteredPosts;
    return filteredPosts.slice(1);
  }, [isBrowsingAll, filteredPosts]);

  // Selected post object
  const activePost = useMemo(() => {
    if (!selectedPostId) return null;
    return posts.find((p) => p.id === selectedPostId) || null;
  }, [posts, selectedPostId]);

  // Related Project object if activePost has one
  const relatedProject = useMemo(() => {
    if (!activePost || !activePost.relatedProjectId) return null;
    const allProjects = getStoredProjects();
    return allProjects.find((p) => p.id === activePost.relatedProjectId) || null;
  }, [activePost]);

  // Related Technical Article if activePost has one
  const relatedArticle = useMemo(() => {
    if (!activePost || !activePost.relatedArticleId) return null;
    const allArticles = getStoredArticles();
    return allArticles.find((a) => a.id === activePost.relatedArticleId) || null;
  }, [activePost]);

  // Previous and Next posts in the same channel
  const { prevPost, nextPost } = useMemo(() => {
    if (!activePost) return { prevPost: null, nextPost: null };
    const idx = channelPosts.findIndex((p) => p.id === activePost.id);
    return {
      prevPost: idx > 0 ? channelPosts[idx - 1] : null,
      nextPost: idx < channelPosts.length - 1 ? channelPosts[idx + 1] : null
    };
  }, [activePost, channelPosts]);

  // Trigger Alomyr Assistant with context
  const handleAskAlomyr = (promptText) => {
    window.dispatchEvent(
      new CustomEvent("open-alomyr-chat", {
        detail: {
          prompt:
            promptText ||
            (lang === "en"
              ? `Tell me more about the blog post "${activePost?.titleEn || activePost?.titlePt}".`
              : `Conte-me mais sobre o post do blog "${activePost?.titlePt || activePost?.titleEn}".`)
        }
      })
    );
  };

  const isTech = activeChannel === "tech";

  return (
    <div className={`blog-page-root channel-${activeChannel}`}>
      {/* Background glow effects */}
      <div className={`blog-ambient-glow ${isTech ? "tech" : "alomyr"}`}></div>

      {/* Top Navbar: Estilo Pílula Flutuante Idêntico ao Portfólio */}
      <header className="site-header blog-site-header">
        <div className="blog-brand-wrapper">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onBackToHome) onBackToHome();
              else window.location.href = "/";
            }}
            className="logo"
          >
            <img src="/wolf(2).png" className="logo-icon" alt="Lobo" />
            <span className="first-name">Matheus</span>{" "}
            <span className="last-name">de Castro</span>
          </a>
          <div className="blog-channel-tag-container">
            <span className="blog-channel-slash">/</span>
            <span className={`blog-channel-indicator-badge ${isTech ? "tech" : "alomyr"}`}>
              {isTech ? "TECH & IA" : "LAB ALOMYR"}
            </span>
          </div>
        </div>

        <nav className="blog-pill-nav">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onBackToHome) onBackToHome();
              else window.location.href = "/";
            }}
            className="blog-nav-item home-pill-link"
            title={t("blog.back_to_portfolio")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>{t("nav.home") || "Início"}</span>
          </a>

          <button
            type="button"
            className="blog-nav-item gateway-pill-link"
            onClick={onNavigateToGateway}
            title={lang === "en" ? "Explore Channels Gateway" : "Explorar Canais Gateway"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Gateway</span>
          </button>

          <button
            type="button"
            className={`blog-nav-item channel-switch-pill ${isTech ? "switch-alomyr" : "switch-tech"}`}
            onClick={() => handleSwitchChannel(isTech ? "alomyr" : "tech")}
            title={isTech ? t("blog.switch_to_alomyr") : t("blog.switch_to_tech")}
          >
            <span className="channel-switch-dot"></span>
            <span>{isTech ? "Lab Alomyr" : "Engenharia Tech"}</span>
          </button>

          <a
            href="/#about"
            onClick={(e) => {
              e.preventDefault();
              if (onBackToHome) onBackToHome();
              setTimeout(() => {
                const el = document.getElementById("about");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 120);
            }}
            className="blog-nav-item about-pill-link"
          >
            {lang === "en" ? "About" : "Sobre"}
          </a>

          <LanguageSwitcher />
        </nav>

        {/* Barra sutil de progresso de leitura integrada ao contorno da pílula */}
        {activePost && (
          <div
            className={`header-reading-bar ${isTech ? "tech" : "alomyr"}`}
            style={{ width: `${readProgress}%` }}
          />
        )}
      </header>

      {/* RENDER VIEW: SINGLE POST READER VS FEED GRID */}
      {activePost ? (
        <article className="blog-reader-view">
          {/* Breadcrumb & Navigation Top */}
          <div className="reader-top-nav-row">
            <div className="reader-breadcrumbs">
              <button
                type="button"
                className="breadcrumb-crumb"
                onClick={onBackToHome}
              >
                {t("nav.home") || "Portfólio"}
              </button>
              <span className="breadcrumb-sep">/</span>
              <button
                type="button"
                className="breadcrumb-crumb"
                onClick={() => handleSelectPost(null)}
              >
                {isTech ? "Engenharia & IA" : "Laboratório Alomyr"}
              </button>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">
                {lang === "en" ? activePost.titleEn : activePost.titlePt}
              </span>
            </div>

            <div className="reader-top-actions">
              <button
                type="button"
                className="reader-back-feed-btn"
                onClick={() => handleSelectPost(null)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>{t("blog.back_to_feed")}</span>
              </button>

              <ShareButton
                title={lang === "en" ? activePost.titleEn : activePost.titlePt}
                text={lang === "en" ? activePost.summaryEn : activePost.summaryPt}
                url={window.location.href}
              />
            </div>
          </div>

          {/* Post Header Hero */}
          <header className="reader-header">
            <div className="reader-meta-top">
              <span className={`reader-category-badge ${isTech ? "tech" : "alomyr"}`}>
                {activePost.category}
              </span>
              <span className="reader-date">
                {t("blog.published_on")} {activePost.publishedAt}
              </span>
              <span className="reader-readtime">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: "4px" }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {activePost.readTime}
              </span>
            </div>

            <h1 className="reader-title">
              {lang === "en" ? activePost.titleEn : activePost.titlePt}
            </h1>

            <p className="reader-lead-summary">
              {lang === "en" ? activePost.summaryEn : activePost.summaryPt}
            </p>

            <div className="reader-author-bar">
              <img
                src={profilePhoto || fotoAlomyr}
                alt="Matheus de Castro"
                className="reader-author-avatar"
              />
              <div>
                <span className="reader-author-name">{activePost.author || "Matheus de Castro"}</span>
                <span className="reader-author-role">
                  {lang === "en"
                    ? "Machine Learning & Backend Architecture"
                    : "Engenharia de Machine Learning & Backend"}
                </span>
              </div>
            </div>

            {/* Tags list */}
            {Array.isArray(activePost.tags) && activePost.tags.length > 0 && (
              <div className="reader-tags-list">
                {activePost.tags.map((tg, idx) => (
                  <span key={idx} className="reader-tag-chip">
                    {tg}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Featured Cover Image if exists and no YouTube video */}
          {activePost.coverImage && !activePost.youtubeUrl && (
            <div className="reader-cover-wrapper">
              <img
                src={activePost.coverImage}
                alt={activePost.titlePt}
                className="reader-cover-img"
              />
            </div>
          )}

          {/* YOUTUBE VIDEO EMBED PLAYER (RESPONSIVE 16:9) */}
          {activePost.youtubeUrl && (() => {
            const embedSrc = getYoutubeEmbedUrl(activePost.youtubeUrl);
            if (!embedSrc) return null;
            return (
              <div className="reader-video-section">
                <div className="video-responsive-container">
                  <iframe
                    src={embedSrc}
                    title={activePost.titlePt}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="video-iframe"
                  ></iframe>
                </div>
                <div className="video-caption">
                  <span className="video-icon">▶</span>
                  <span>
                    {lang === "en"
                      ? "Official Demonstration & Interactive Walkthrough"
                      : "Vídeo de Demonstração & Processo Explicado"}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* STRONG BIDIRECTIONAL LINK: RELATED PORTFOLIO PROJECT */}
          {relatedProject && (
            <div className="reader-related-project-box">
              <div className="related-icon-glow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </div>
              <div className="related-project-info">
                <span className="related-tag-badge">{t("blog.related_project")}</span>
                <h3 className="related-title">
                  {lang === "en" ? relatedProject.titleEn || relatedProject.title : relatedProject.titlePt || relatedProject.title}
                </h3>
                <p className="related-desc">
                  {lang === "en"
                    ? relatedProject.shortDescriptionEn || relatedProject.shortDescription
                    : relatedProject.shortDescriptionPt || relatedProject.shortDescription}
                </p>
              </div>
              <div className="related-project-action">
                <button
                  type="button"
                  className="related-visit-btn"
                  onClick={() => {
                    if (onOpenProject) {
                      onOpenProject(relatedProject);
                    } else {
                      window.location.href = `/?project=${encodeURIComponent(relatedProject.id)}`;
                    }
                  }}
                >
                  <span>{lang === "en" ? "View in Portfolio" : "Ver no Portfólio"}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* STRONG BIDIRECTIONAL LINK: RELATED TECHNICAL ARTICLE */}
          {relatedArticle && (
            <div className="reader-related-project-box article-linked">
              <div className="related-icon-glow" style={{ color: "#38bdf8", borderColor: "rgba(6, 182, 212, 0.4)", background: "rgba(6, 182, 212, 0.15)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <div className="related-project-info">
                <span className="related-tag-badge" style={{ color: "#38bdf8", background: "rgba(6, 182, 212, 0.15)", borderColor: "rgba(6, 182, 212, 0.35)" }}>
                  {lang === "en" ? "Related Technical Article" : "Artigo Técnico Vinculado"}
                </span>
                <h3 className="related-title">
                  {lang === "en" ? relatedArticle.titleEn || relatedArticle.title : relatedArticle.titlePt || relatedArticle.title}
                </h3>
                <p className="related-desc">
                  {lang === "en"
                    ? relatedArticle.shortDescriptionEn || relatedArticle.shortDescription
                    : relatedArticle.shortDescriptionPt || relatedArticle.shortDescription}
                </p>
              </div>
              <div className="related-project-action">
                <button
                  type="button"
                  className="related-visit-btn"
                  style={{ borderColor: "#06b6d4", background: "rgba(6, 182, 212, 0.2)", color: "#e0f2fe" }}
                  onClick={() => {
                    if (onOpenProject) {
                      onOpenProject(relatedArticle);
                    } else {
                      window.location.href = `/?project=${encodeURIComponent(relatedArticle.id)}`;
                    }
                  }}
                >
                  <span>{lang === "en" ? "Read Article in Portfolio" : "Ler Artigo no Portfólio"}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* MAIN POST CONTENT (RICH MARKDOWN) */}
          <div className="reader-markdown-body">
            <BlogMarkdownRenderer
              content={
                lang === "en"
                  ? activePost.contentEn || activePost.contentPt
                  : activePost.contentPt || activePost.contentEn
              }
            />
          </div>

          {/* PHOTO GALLERY SLIDER / GRID */}
          {Array.isArray(activePost.galleryImages) && activePost.galleryImages.length > 0 && (
            <section className="reader-gallery-section">
              <div className="gallery-header">
                <span className="gallery-badge">{t("blog.gallery_attached")}</span>
                <h3 className="gallery-title">
                  {lang === "en" ? "Visual Records & Process Captures" : "Registros Visuais & Capturas de Processo"}
                </h3>
              </div>
              <div className="gallery-grid">
                {activePost.galleryImages.map((imgUrl, gIdx) => (
                  <div
                    key={gIdx}
                    className="gallery-item-wrapper"
                    onClick={() => setLightboxImg(imgUrl)}
                  >
                    <img
                      src={imgUrl}
                      alt={`Galeria ${gIdx + 1}`}
                      className="gallery-thumb"
                      loading="lazy"
                    />
                    <div className="gallery-item-hover">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <span>{lang === "en" ? "Expand" : "Ampliar"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ASK ALOMYR CONTEXTUAL BANNER */}
          <div className="reader-alomyr-banner">
            <div className="alomyr-banner-avatar">
              <img src="/wolf(2).png" alt="Alomyr" />
            </div>
            <div className="alomyr-banner-content">
              <h4>
                {lang === "en"
                  ? "Questions about this publication?"
                  : "Dúvidas sobre esta publicação?"}
              </h4>
              <p>
                {lang === "en"
                  ? "Ask Alomyr, the AI agent, to explain technical nuances, math architectures, or creative decisions."
                  : "Peça ao Alomyr, o agente de IA, para explicar nuances técnicas, modelos matemáticos ou decisões criativas."}
              </p>
            </div>
            <button
              type="button"
              className="alomyr-banner-btn"
              onClick={() => handleAskAlomyr()}
            >
              <span>{lang === "en" ? "Ask Alomyr" : "Perguntar ao Alomyr"}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>

          {/* PREVIOUS / NEXT POST NAVIGATION */}
          <footer className="reader-footer-nav">
            {prevPost ? (
              <button
                type="button"
                className="nav-post-btn prev"
                onClick={() => handleSelectPost(prevPost)}
              >
                <span className="nav-dir-label">← {lang === "en" ? "Previous" : "Anterior"}</span>
                <span className="nav-post-title">
                  {lang === "en" ? prevPost.titleEn : prevPost.titlePt}
                </span>
              </button>
            ) : (
              <div></div>
            )}

            {nextPost && (
              <button
                type="button"
                className="nav-post-btn next"
                onClick={() => handleSelectPost(nextPost)}
              >
                <span className="nav-dir-label">{lang === "en" ? "Next" : "Próximo"} →</span>
                <span className="nav-post-title">
                  {lang === "en" ? nextPost.titleEn : nextPost.titlePt}
                </span>
              </button>
            )}
          </footer>
        </article>
      ) : (
        /* FEED VIEW (EI NERD INSPIRED EDITORIAL PORTAL) */
        <main className="blog-feed-container">
          {/* Channel Banner */}
          <section className="feed-hero-section">
            <div className="channel-badge-pill">
              <span className="pill-dot"></span>
              {isTech ? t("blog.portal_tech_tag") : t("blog.portal_alomyr_tag")}
            </div>
            <h1 className="feed-hero-title">
              {isTech ? t("blog.portal_tech_title") : t("blog.portal_alomyr_title")}
            </h1>
            <p className="feed-hero-subtitle">
              {isTech ? t("blog.portal_tech_desc") : t("blog.portal_alomyr_desc")}
            </p>

            {/* Search Input Bar */}
            <div className="feed-controls-card">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder={t("blog.search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchQuery("")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters / Result Counter Badge */}
            {(searchQuery.trim() || selectedTag) && (
              <div className="active-filters-bar" style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", width: "100%", maxWidth: "620px", background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "12px", padding: "0.6rem 1rem", fontSize: "0.85rem", color: "#e2e8f0" }}>
                <span>
                  {filteredPosts.length} {filteredPosts.length === 1 ? (lang === "en" ? "post found" : "publicação encontrada") : (lang === "en" ? "posts found" : "publicações encontradas")}
                  {selectedTag && ` • Tag: ${selectedTag}`}
                  {searchQuery.trim() && ` • "${searchQuery}"`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTag(null);
                  }}
                  style={{ background: "transparent", border: "none", color: "#a78bfa", textDecoration: "underline", cursor: "pointer", fontSize: "0.82rem", fontWeight: "600" }}
                >
                  {lang === "en" ? "Clear Filters" : "Limpar Filtros"}
                </button>
              </div>
            )}
          </section>

          {/* EI NERD STYLE: TRENDING TOPICS (TÓPICOS EM ALTA) BAR */}
          {availableTags.length > 0 && (
            <div className="einerd-trending-bar">
              <div className="einerd-trending-label">
                <svg className="trending-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#f59e0b" }}>
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                <span>{t("blog.trending_topics")}</span>
              </div>
              <div className="einerd-trending-chips">
                <button
                  type="button"
                  className={`einerd-trending-chip ${selectedTag === null ? "active" : ""}`}
                  onClick={() => setSelectedTag(null)}
                >
                  {t("blog.all_tags")} ({channelPosts.length})
                </button>
                {availableTags.map((tg, idx) => {
                  const count = channelPosts.filter(
                    (p) => Array.isArray(p.tags) && p.tags.includes(tg)
                  ).length;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`einerd-trending-chip ${selectedTag === tg ? "active" : ""}`}
                      onClick={() => setSelectedTag(selectedTag === tg ? null : tg)}
                    >
                      {tg} <span className="chip-count">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* EI NERD STYLE: HERO FEATURED ARTICLE (MANCHETE PRINCIPAL) */}
          {featuredPost && (
            <section className="einerd-featured-section">
              <article
                className="einerd-featured-card"
                onClick={() => handleSelectPost(featuredPost)}
              >
                <div className="einerd-featured-media">
                  {featuredPost.coverImage ? (
                    <img
                      src={featuredPost.coverImage}
                      alt={lang === "en" ? featuredPost.titleEn || featuredPost.titlePt : featuredPost.titlePt}
                      className="einerd-featured-img"
                    />
                  ) : (
                    <div className={`einerd-featured-placeholder ${isTech ? "tech" : "alomyr"}`}>
                      <span>{isTech ? "DEEP TECH" : "CREATIVE LAB"}</span>
                    </div>
                  )}
                  <div className="einerd-featured-overlay" />
                  
                  {/* Floating Badges */}
                  <div className="einerd-floating-badges">
                    <span className={`einerd-badge-lead ${isTech ? "tech" : "alomyr"}`}>
                      {t("blog.featured_lead")}
                    </span>
                    {featuredPost.youtubeUrl && (
                      <span className="floating-badge video-badge" title={t("blog.video_attached")}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: "3px" }}>
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Vídeo
                      </span>
                    )}
                    {Array.isArray(featuredPost.galleryImages) && featuredPost.galleryImages.length > 0 && (
                      <span className="floating-badge gallery-badge" title={t("blog.gallery_attached")}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "3px" }}>
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        {featuredPost.galleryImages.length} Fotos
                      </span>
                    )}
                    {featuredPost.relatedProjectId && (
                      <span className="floating-badge project-badge" title={t("blog.related_project")}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "3px" }}>
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        Projeto
                      </span>
                    )}
                    {featuredPost.relatedArticleId && (
                      <span className="floating-badge article-badge" title="Artigo Técnico Vinculado" style={{ background: "rgba(6, 182, 212, 0.9)", color: "#042f2e" }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "3px" }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        </svg>
                        Artigo
                      </span>
                    )}
                  </div>
                </div>

                <div className="einerd-featured-content">
                  <div className="einerd-meta-row">
                    <span className={`einerd-category ${isTech ? "tech" : "alomyr"}`}>
                      {featuredPost.category}
                    </span>
                    <span className="einerd-meta-item">{featuredPost.readTime}</span>
                    <span className="einerd-meta-item">{featuredPost.publishedAt}</span>
                  </div>

                  <h2 className="einerd-featured-title">
                    {lang === "en" ? featuredPost.titleEn || featuredPost.titlePt : featuredPost.titlePt}
                  </h2>

                  <p className="einerd-featured-summary">
                    {lang === "en" ? featuredPost.summaryEn || featuredPost.summaryPt : featuredPost.summaryPt}
                  </p>

                  <div className="einerd-featured-footer">
                    <div className="einerd-author-info">
                      <span className="einerd-author-dot"></span>
                      <span className="einerd-author-name">{featuredPost.author || "Matheus de Castro"}</span>
                    </div>

                    <div className="einerd-featured-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={`einerd-read-btn ${isTech ? "tech" : "alomyr"}`}
                        onClick={() => handleSelectPost(featuredPost)}
                      >
                        <span>{t("blog.read_story")}</span>
                        <span className="btn-arrow">→</span>
                      </button>

                      <ShareButton
                        title={lang === "en" ? featuredPost.titleEn || featuredPost.titlePt : featuredPost.titlePt}
                        text={lang === "en" ? featuredPost.summaryEn || featuredPost.summaryPt : featuredPost.summaryPt}
                        url={`${window.location.origin}${isTech ? "/blog" : "/blog/alomyr"}?post=${encodeURIComponent(featuredPost.id)}`}
                      />
                    </div>
                  </div>
                </div>
              </article>
            </section>
          )}

          {/* EDITORIAL GRID HEADING */}
          <div className="einerd-grid-header">
            <div className="einerd-header-left">
              <span className={`einerd-accent-pill ${isTech ? "tech" : "alomyr"}`}></span>
              <h3 className="einerd-grid-title">
                {isBrowsingAll
                  ? t("blog.latest_stories")
                  : (selectedTag
                      ? `${t("blog.latest_stories")} — ${selectedTag} (${filteredPosts.length})`
                      : `${t("blog.latest_stories")} (${filteredPosts.length})`)}
              </h3>
            </div>

            {(selectedTag || searchQuery) && (
              <button
                type="button"
                className="einerd-clear-tag-btn"
                onClick={() => {
                  setSelectedTag(null);
                  setSearchQuery("");
                }}
              >
                ✕ {t("blog.clear_filters")}
              </button>
            )}
          </div>

          {/* POSTS GRID */}
          <section className="feed-grid-section">
            {regularPosts.length === 0 && !featuredPost ? (
              <div className="empty-feed-card">
                <div className="empty-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <h3>{t("blog.no_posts_found")}</h3>
                <p>
                  {lang === "en"
                    ? "Try adjusting your search terms or clearing the selected tag filter."
                    : "Tente ajustar os termos da busca ou limpe o filtro de tag selecionado."}
                </p>
                {(selectedTag || searchQuery) && (
                  <button
                    type="button"
                    className="reset-filter-btn"
                    onClick={() => {
                      setSelectedTag(null);
                      setSearchQuery("");
                    }}
                  >
                    {t("blog.clear_filters")}
                  </button>
                )}
              </div>
            ) : regularPosts.length === 0 && featuredPost ? (
              <div className="einerd-only-featured-note">
                <p>
                  {lang === "en"
                    ? "Viewing the latest lead story above. More articles coming soon!"
                    : "Exibindo a manchete principal acima. Novas matérias em breve!"}
                </p>
              </div>
            ) : (
              <div className="blog-posts-grid">
                {regularPosts.map((post) => {
                  const title = lang === "en" ? post.titleEn || post.titlePt : post.titlePt;
                  const summary = lang === "en" ? post.summaryEn || post.summaryPt : post.summaryPt;
                  const hasVideo = !!post.youtubeUrl;
                  const galleryCount = Array.isArray(post.galleryImages) ? post.galleryImages.length : 0;
                  const hasProject = !!post.relatedProjectId;

                  return (
                    <article key={post.id} className="post-card">
                      {/* Card Cover */}
                      <div
                        className="post-card-cover-wrapper"
                        onClick={() => handleSelectPost(post)}
                      >
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={title}
                            className="post-card-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className={`post-card-placeholder ${isTech ? "tech" : "alomyr"}`}>
                            <span>{isTech ? "DEEP TECH" : "CREATIVE LAB"}</span>
                          </div>
                        )}

                        {/* Top Badges on Cover */}
                        <div className="card-floating-badges">
                          {hasVideo && (
                            <span className="floating-badge video-badge" title={t("blog.video_attached")}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: "3px" }}>
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                              </svg>
                              Vídeo
                            </span>
                          )}
                          {galleryCount > 0 && (
                            <span className="floating-badge gallery-badge" title={t("blog.gallery_attached")}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "3px" }}>
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                              {galleryCount} Fotos
                            </span>
                          )}
                          {hasProject && (
                            <span className="floating-badge project-badge" title={t("blog.related_project")}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "3px" }}>
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                              </svg>
                              Projeto
                            </span>
                          )}
                          {post.relatedArticleId && (
                            <span className="floating-badge article-badge" title="Artigo Técnico Vinculado" style={{ background: "rgba(6, 182, 212, 0.9)", color: "#042f2e" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "3px" }}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              </svg>
                              Artigo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="post-card-body">
                        <div className="post-card-meta">
                          <span className={`post-category ${isTech ? "tech" : "alomyr"}`}>
                            {post.category}
                          </span>
                          <span className="post-readtime">{post.readTime}</span>
                          <span className="post-date">{post.publishedAt}</span>
                        </div>

                        <h2
                          className="post-card-title"
                          onClick={() => handleSelectPost(post)}
                        >
                          {title}
                        </h2>

                        <p className="post-card-summary">{summary}</p>

                        {/* Tags */}
                        {Array.isArray(post.tags) && post.tags.length > 0 && (
                          <div className="post-card-tags">
                            {post.tags.slice(0, 4).map((tg, idx) => (
                              <span
                                key={idx}
                                className="post-card-tag-chip"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(tg);
                                }}
                              >
                                {tg}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Card Bottom Actions */}
                        <div className="post-card-footer">
                          <button
                            type="button"
                            className="post-read-btn"
                            onClick={() => handleSelectPost(post)}
                          >
                            <span>{t("blog.read_more")}</span>
                            <span className="btn-arrow">→</span>
                          </button>

                          <ShareButton
                            title={title}
                            text={summary}
                            url={`${window.location.origin}${isTech ? "/blog" : "/blog/alomyr"}?post=${encodeURIComponent(post.id)}`}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      )}

      {/* LIGHTBOX MODAL FOR GALLERY IMAGES */}
      {lightboxImg && (
        <div className="blog-lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <div className="blog-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="blog-lightbox-close"
              onClick={() => setLightboxImg(null)}
            >
              ✕
            </button>
            <img src={lightboxImg} alt="Visualização em alta resolução" className="blog-lightbox-img" />
          </div>
        </div>
      )}
      {/* Botão Flutuante Voltar ao Topo */}
      {showBackToTop && (
        <button
          type="button"
          className={`blog-floating-back-to-top ${isTech ? "tech" : "alomyr"}`}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title={lang === "en" ? "Scroll to top" : "Voltar ao topo"}
          aria-label="Scroll to top"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}
    </div>
  );
}

// ==========================================
// RENDERIZADOR DE MARKDOWN NATIVO COM FORMATAÇÃO
// ==========================================
function BlogMarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const rendered = [];
  let inCode = false;
  let codeBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCode) {
        rendered.push(
          <div key={`code-${i}`} className="blog-code-block">
            <pre>
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (line.startsWith("## ")) {
      rendered.push(
        <h2 key={i} className="blog-md-h2">
          {formatInline(line.substring(3))}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      rendered.push(
        <h3 key={i} className="blog-md-h3">
          {formatInline(line.substring(4))}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      rendered.push(
        <li key={i} className="blog-md-li">
          {formatInline(line.substring(2))}
        </li>
      );
    } else if (line.startsWith("> ")) {
      rendered.push(
        <blockquote key={i} className="blog-md-quote">
          {formatInline(line.substring(2))}
        </blockquote>
      );
    } else if (line.trim().length > 0) {
      rendered.push(
        <p key={i} className="blog-md-p">
          {formatInline(line)}
        </p>
      );
    }
  }

  return <div className="blog-markdown-content">{rendered}</div>;
}

function formatInline(text) {
  if (!text) return "";
  const parts = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(<code key={match.index} className="inline-code">{token.slice(1, -1)}</code>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
