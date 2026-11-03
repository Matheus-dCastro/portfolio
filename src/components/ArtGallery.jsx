import { useState, useEffect, useCallback } from "react";

export default function ArtGallery({ artDrawings = [] }) {
  const [selectedArtIndex, setSelectedArtIndex] = useState(null);

  const selectedArt =
    selectedArtIndex !== null && artDrawings[selectedArtIndex]
      ? artDrawings[selectedArtIndex]
      : null;

  const openArt = (index) => setSelectedArtIndex(index);
  const closeLightbox = useCallback(() => setSelectedArtIndex(null), []);

  const showPrev = useCallback(
    (event) => {
      if (event) event.stopPropagation();
      if (artDrawings.length === 0) return;
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
            <p className="gallery-eyebrow">GALLERY</p>
            <h2 style={{ marginBottom: 0 }}>
              My <span>Drawings</span>
            </h2>
          </div>
          {artDrawings.length > 0 && (
            <div className="gallery-counter-badge">
              <span>🎨</span> {artDrawings.length} {artDrawings.length === 1 ? "Obra" : "Obras"}
            </div>
          )}
        </div>

        <div className="masonry-gallery">
          {artDrawings.map((art, index) => (
            <div
              className="art-item"
              key={art.id || `${art.title}-${index}`}
              onClick={() => openArt(index)}
              title={`Clique para ampliar: ${art.title}`}
            >
              <div className="art-image-container">
                <img
                  src={art.src}
                  alt={art.title}
                  loading="lazy"
                />
                <div className="art-zoom-hint">
                  <span>🔍 Expandir</span>
                </div>
              </div>
              <div className="art-overlay">
                <span className="art-overlay-title">{art.title}</span>
                {art.description && (
                  <span className="art-overlay-desc">{art.description}</span>
                )}
              </div>
            </div>
          ))}
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
                {selectedArtIndex + 1} / {artDrawings.length}
              </span>
              <button
                type="button"
                className="close-lightbox-btn"
                onClick={closeLightbox}
                title="Fechar (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Navigation and Main Image */}
            <div className="lightbox-stage">
              <button
                type="button"
                className="lightbox-nav prev"
                onClick={showPrev}
                title="Anterior (Seta Esquerda)"
              >
                ‹
              </button>

              <div className="lightbox-image-box">
                <img src={selectedArt.src} alt={selectedArt.title} />
              </div>

              <button
                type="button"
                className="lightbox-nav next"
                onClick={showNext}
                title="Próxima (Seta Direita)"
              >
                ›
              </button>
            </div>

            {/* Bottom Caption */}
            <div className="lightbox-caption-card">
              <h3 className="lightbox-caption-title">{selectedArt.title}</h3>
              {selectedArt.description && (
                <p className="lightbox-caption-text">{selectedArt.description}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
