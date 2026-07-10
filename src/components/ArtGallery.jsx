import React, { useState } from "react";

export default function ArtGallery({ artDrawings }) {
  const [selectedArtIndex, setSelectedArtIndex] = useState(null);

  const selectedArt =
    selectedArtIndex !== null ? artDrawings[selectedArtIndex] : null;

  const openArt = (index) => setSelectedArtIndex(index);
  const closeLightbox = () => setSelectedArtIndex(null);

  const showPrev = (event) => {
    event.stopPropagation();
    setSelectedArtIndex((prev) =>
      prev === 0 || prev === null ? artDrawings.length - 1 : prev - 1,
    );
  };

  const showNext = (event) => {
    event.stopPropagation();
    setSelectedArtIndex((prev) =>
      prev === null || prev === artDrawings.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <>
      <section id="art-gallery">
        <div className="art-gallery-header">
          <div>
            <p
              style={{
                color: "var(--purple)",
                fontWeight: "bold",
                letterSpacing: "2px",
              }}
            >
              GALLERY
            </p>
            <h2 style={{ marginBottom: 0 }}>
              My <span>Drawings</span>
            </h2>
          </div>
        </div>

        <div className="masonry-gallery">
          {artDrawings.map((art, index) => (
            <div className="art-item" key={`${art.title}-${index}`}>
              <img
                src={art.src}
                alt={art.title}
                onClick={() => openArt(index)}
              />
              <div className="art-overlay">
                <span>{art.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div
        className={`lightbox ${selectedArt ? "active" : ""}`}
        onClick={closeLightbox}
      >
        <span className="close-lightbox" onClick={closeLightbox}>
          &times;
        </span>

        {selectedArt && (
          <div
            className="lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="lightbox-nav prev" onClick={showPrev}>
              ←
            </button>
            <img src={selectedArt.src} alt={selectedArt.title} />
            <button className="lightbox-nav next" onClick={showNext}>
              →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
