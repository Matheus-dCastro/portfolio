import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../context/useLanguage";
import ShareButton from "./ShareButton";

export default function ArtGallery({ artDrawings = [] }) {
  const { t, lang } = useLanguage();
  const [selectedArtIndex, setSelectedArtIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const selectedArt =
    selectedArtIndex !== null && artDrawings[selectedArtIndex]
      ? artDrawings[selectedArtIndex]
      : null;

  const openArt = (index) => {
    setSelectedArtIndex(index);
    setIsZoomed(false);
  };

  const closeLightbox = useCallback(() => {
    setSelectedArtIndex(null);
    setIsZoomed(false);
  }, []);

  const showPrev = useCallback(
    (event) => {
      if (event) event.stopPropagation();
      if (artDrawings.length === 0) return;
      setIsZoomed(false);
      setSelectedArtIndex((prev) =>
        prev === 0 || prev === null ? artDrawings.length - 1 : prev - 1,
      );
    },
    [artDrawings.length]
  );

  const showNext = useCallback(
    (event) => {
      if (event) event.stopPropagation();
      if (artDrawings.length === 0) return;
      setIsZoomed(false);
      setSelectedArtIndex((prev) =>
        prev === null || prev === artDrawings.length - 1 ? 0 : prev + 1,
      );
    },
    [artDrawings.length]
  );

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (selectedArtIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "z" || e.key === "Z") setIsZoomed((prev) => !prev);
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedArtIndex, closeLightbox, showPrev, showNext]);

  return (
    <>
      <section id="art-gallery">
        <div className="art-gallery-header">
          <div>
            <p className="gallery-eyebrow">{t("gallery.eyebrow")}</p>
            <h2 style={{ marginBottom: 0 }}>
              {t("gallery.title_prefix")}<span>{t("gallery.title_highlight")}</span>
            </h2>
          </div>
          {artDrawings.length > 0 && (
            <div className="gallery-counter-badge">
              {artDrawings.length}{" "}
              {artDrawings.length === 1 ? t("gallery.counter_single") : t("gallery.counter_plural")} • {lang === "en" ? "Hyper-realism" : "Hiper-realismo"}
            </div>
          )}
        </div>

        <div className="masonry-gallery">
          {artDrawings.map((art, index) => {
            const title = lang === "en" ? (art.titleEn || art.title) : (art.titlePt || art.title);
            const desc = lang === "en" ? (art.descriptionEn || art.description) : (art.descriptionPt || art.description);

            return (
              <div
                className="art-item"
                key={art.id || `${art.title}-${index}`}
                onClick={() => openArt(index)}
                title={`${t("gallery.click_to_zoom")} ${title}`}
              >
                <div className="art-image-container">
                  <img
                    src={art.src}
                    alt={title}
                    loading="lazy"
                  />
                  <div className="art-zoom-hint">
                    <span>🔍 {t("gallery.expand")}</span>
                  </div>
                </div>
                <div className="art-overlay">
                  <span className="art-overlay-title">{title}</span>
                  {desc && (
                    <span className="art-overlay-desc">{desc}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div
        className={`lightbox ${selectedArt ? "active" : ""}`}
        onClick={closeLightbox}
        role="dialog"
        aria-modal="true"
      >
        {selectedArt && (
          <div
            className="lightbox-wrapper"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="lightbox-top-bar">
              <span className="lightbox-counter-label">
                {selectedArtIndex + 1} / {artDrawings.length} • {lang === "en" ? "Hyper-realism Art" : "Hiper-realismo"}
              </span>

              <div className="lightbox-toolbar-actions">
                <button
                  type="button"
                  className="lightbox-tool-btn"
                  onClick={() => setIsZoomed(!isZoomed)}
                  title={isZoomed ? "Diminuir Zoom (Z)" : "Ampliar Detalhes HD (Z)"}
                >
                  <span>{isZoomed ? "🔍 100%" : "🔍 Zoom HD"}</span>
                </button>

                <a
                  href={selectedArt.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lightbox-tool-btn"
                  title="Abrir arquivo de alta resolução em nova aba"
                >
                  <span>HD ↗</span>
                </a>

                <ShareButton
                  title={lang === "en" ? (selectedArt.titleEn || selectedArt.title) : (selectedArt.titlePt || selectedArt.title)}
                  text={lang === "en" ? (selectedArt.descriptionEn || selectedArt.description) : (selectedArt.descriptionPt || selectedArt.description)}
                  url={`/?page=hobbies#drawing-${selectedArt.id || selectedArtIndex}`}
                  className="lightbox-tool-btn"
                />

                <button
                  type="button"
                  className="close-lightbox-btn"
                  onClick={closeLightbox}
                  title="Fechar (Esc)"
                  aria-label="Fechar"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Navigation and Main Image Stage */}
            <div className="lightbox-stage">
              <button
                type="button"
                className="lightbox-nav prev"
                onClick={showPrev}
                title="Anterior (←)"
                aria-label="Anterior"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div className={`lightbox-image-box ${isZoomed ? "zoomed-wrapper" : ""}`}>
                <img
                  src={selectedArt.src}
                  alt={selectedArt.title}
                  className={isZoomed ? "zoomed-img" : ""}
                  onClick={() => setIsZoomed(!isZoomed)}
                  title={isZoomed ? "Clique para diminuir" : "Clique para ampliar em alta definição"}
                />
              </div>

              <button
                type="button"
                className="lightbox-nav next"
                onClick={showNext}
                title="Próximo (→)"
                aria-label="Próximo"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            {/* Bottom Caption */}
            <div className="lightbox-caption-card">
              <span className="art-technique-pill">
                🎨 {lang === "en" ? "Graphite on Paper • Hyper-realism" : "Grafite sobre Papel • Hiper-realismo"}
              </span>
              <h3 className="lightbox-caption-title">
                {lang === "en" ? (selectedArt.titleEn || selectedArt.title) : (selectedArt.titlePt || selectedArt.title)}
              </h3>
              {(selectedArt.descriptionEn || selectedArt.description) && (
                <p className="lightbox-caption-text">
                  {lang === "en" ? (selectedArt.descriptionEn || selectedArt.description) : (selectedArt.descriptionPt || selectedArt.description)}
                </p>
              )}
              <span className="art-lightbox-hint">
                {lang === "en"
                  ? "⌨️ Arrow keys ← / → to navigate • Click image or 'Z' for zoom • Esc to exit"
                  : "⌨️ Use as setas ← / → para navegar • Clique na imagem ou aperte 'Z' para zoom • Esc para fechar"}
              </span>
            </div>

            {/* Thumbnails Mini Carousel Strip */}
            {artDrawings.length > 1 && (
              <div className="lightbox-thumbnails-strip">
                {artDrawings.map((thumb, tIdx) => (
                  <button
                    key={thumb.id || tIdx}
                    type="button"
                    className={`lightbox-thumb-btn ${tIdx === selectedArtIndex ? "active" : ""}`}
                    onClick={() => {
                      setSelectedArtIndex(tIdx);
                      setIsZoomed(false);
                    }}
                    title={lang === "en" ? (thumb.titleEn || thumb.title) : (thumb.titlePt || thumb.title)}
                  >
                    <img src={thumb.src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
