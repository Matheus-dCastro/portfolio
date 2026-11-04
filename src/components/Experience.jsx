import { useState } from "react";
import { useLanguage } from "../context/useLanguage";

function Experience({ expData }) {
  const { t, lang } = useLanguage();
  const [currentExpIndex, setCurrentExpIndex] = useState(0);

  if (!expData || expData.length === 0) return null;

  const changeExp = (direction) => {
    let nextIndex = currentExpIndex + direction;
    if (nextIndex < 0) nextIndex = expData.length - 1;
    if (nextIndex >= expData.length) nextIndex = 0;
    setCurrentExpIndex(nextIndex);
  };

  const activeData = expData[currentExpIndex];
  const title = lang === "en" ? (activeData.titleEn || activeData.title) : (activeData.titlePt || activeData.title);
  const time = lang === "en" ? (activeData.timeEn || activeData.time) : (activeData.timePt || activeData.time);
  const bullets = (lang === "en" ? (activeData.bulletsEn || activeData.bullets) : (activeData.bulletsPt || activeData.bullets)) || [];

  return (
    <>
      <div className="section-divider-line"></div>

      <h2>{t("experience.title")}</h2>

      <div className="experience-grid">
        <div className="exp-tabs-column">
          <div className="exp-vertical-accent-line"></div>
          <div className="exp-tabs">
            {expData.map((exp, idx) => (
              <button
                key={idx}
                className={`tab-btn ${idx === currentExpIndex ? "active" : ""}`}
                onClick={() => setCurrentExpIndex(idx)}
              >
                {idx === currentExpIndex && <span className="tab-dot"></span>}
                {exp.company}
              </button>
            ))}
          </div>

          <div className="exp-pagination">
            <button className="pag-arrow" onClick={() => changeExp(-1)} aria-label="Previous experience">
              &lt;
            </button>
            <span className="pag-text">
              {currentExpIndex + 1} {t("experience.pagination_of")} {expData.length}
            </span>
            <button className="pag-arrow" onClick={() => changeExp(1)} aria-label="Next experience">
              &gt;
            </button>
          </div>
        </div>

        <div className="exp-content-column">
          <div className="exp-display-card">
            <div className="exp-card-body">
              <h3>
                {title} |{" "}
                <span className="company-highlight">{activeData.company}</span>
              </h3>
              <p className="exp-timeline">{time}</p>
              <div className="card-inner-divider"></div>
              <ul className="exp-bullet-list">
                {bullets.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Experience;
