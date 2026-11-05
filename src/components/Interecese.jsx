// src/components/Interecese.jsx
import { useState, useEffect } from "react";
import { useLanguage } from "../context/useLanguage";
import { getStoredHobbies } from "../data/projectsData";
import { fetchHobbies } from "../lib/supabaseService";

function Intereceses({ mensagem, capa1, capa2, capa3, capa4, capa5, capa6 }) {
  const { t, lang } = useLanguage();
  const [hobbies, setHobbies] = useState(() => getStoredHobbies());

  useEffect(() => {
    fetchHobbies().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setHobbies(data);
      }
    });
  }, []);

  const fallbackCovers = [capa1, capa2, capa3, capa4, capa5, capa6, capa1];

  return (
    <section className="hobbies-section">
      <p
        style={{
          color: "var(--purple)",
          fontWeight: "bold",
          letterSpacing: "2px",
        }}
      >
        {t("hobbies.eyebrow")}
      </p>
      <h2 style={{ fontSize: "4rem", marginBottom: "20px" }}>
        {t("hobbies.title_prefix")}<span>{t("hobbies.title_highlight")}</span>{t("hobbies.title_suffix")}
      </h2>
      <p className="hobby-intro">{mensagem || t("hobbies.intro")}</p>

      <div className="hobbies-grid">
        {hobbies
          .filter((hobby) => hobby.isPublished !== false)
          .map((hobby, index) => {
            const title =
              lang === "en"
                ? hobby.titleEn || hobby.titlePt || ""
                : hobby.titlePt || hobby.titleEn || "";
            const desc =
              lang === "en"
                ? hobby.descriptionEn || hobby.descriptionPt || ""
                : hobby.descriptionPt || hobby.descriptionEn || "";
            const cover = hobby.photoUrl || fallbackCovers[index % fallbackCovers.length];

            return (
              <div
                key={hobby.id || index}
                className={`hobby-card ${hobby.layout || ""}`}
              >
                <img src={cover} alt={title} loading="lazy" />
                <div className="hobby-content">
                  <span className="hobby-category">{hobby.category || "Hobby"}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
}

export default Intereceses;
