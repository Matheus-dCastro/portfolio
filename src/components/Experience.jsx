import { useState } from "react";

function Experience({ expData }) {
  // Corrigido: Recebendo com chaves {}
  const [currentExpIndex, setCurrentExpIndex] = useState(0);

  // Proteção para não quebrar o código se a lista de dados sumir ou falhar
  if (!expData || expData.length === 0) return null;

  const changeExp = (direction) => {
    let nextIndex = currentExpIndex + direction;
    if (nextIndex < 0) nextIndex = expData.length - 1;
    if (nextIndex >= expData.length) nextIndex = 0;
    setCurrentExpIndex(nextIndex);
  };

  const activeData = expData[currentExpIndex];

  return (
    <>
      <div className="section-divider-line"></div>

      <h2>Experiência</h2>

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
            <button className="pag-arrow" onClick={() => changeExp(-1)}>
              &lt;
            </button>
            <span className="pag-text">
              {currentExpIndex + 1} de {expData.length}
            </span>
            <button className="pag-arrow" onClick={() => changeExp(1)}>
              &gt;
            </button>
          </div>
        </div>

        <div className="exp-content-column">
          <div className="exp-display-card">
            <div className="exp-card-body">
              <h3>
                {activeData.title} |{" "}
                <span className="company-highlight">{activeData.company}</span>
              </h3>
              <p className="exp-timeline">{activeData.time}</p>
              <div className="card-inner-divider"></div>
              <ul className="exp-bullet-list">
                {activeData.bullets.map((bullet, idx) => (
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
