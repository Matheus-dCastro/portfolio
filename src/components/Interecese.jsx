import React from "react";

function Intereceses({ mensagem, capa1, capa2, capa3, capa4, capa5, capa6 }) {
  return (
    <section className="hobbies-section">
      <p
        style={{
          color: "var(--purple)",
          fontWeight: "bold",
          letterSpacing: "2px",
        }}
      >
        BEYOND THE CODE
      </p>
      <h2 style={{ fontSize: "4rem", marginBottom: "20px" }}>
        My <span>Hobbies</span> & Studies
      </h2>
      <p className="hobby-intro">{mensagem}</p>

      <div className="hobbies-grid">
        <div className="hobby-card tall">
          <img src={capa1} alt="Desenho" />
          <div className="hobby-content">
            <span className="hobby-category">Art</span>
            <h3>Drawings</h3>
            <p>Explorando anatomia e hiperrealismo.</p>
          </div>
        </div>

        <div className="hobby-card wide">
          <img src={capa2} alt="Gaming" />
          <div className="hobby-content">
            <span className="hobby-category">Gaming</span>
            <h3>Campaign and narratives</h3>
            <p>De Elden Ring a cuphead.</p>
          </div>
        </div>

        <div className="hobby-card">
          <img src={capa3} alt="Desenho" />
          <div className="hobby-content">
            <span className="hobby-category">Future</span>
            <h3>AR & AI</h3>
            <p>O futuro da Realidade Aumentada.</p>
          </div>
        </div>

        <div className="hobby-card">
          <img src={capa4} alt="Desenho" />
          <div className="hobby-content">
            <span className="hobby-category">Reading</span>
            <h3>Sci-Fi & Tech</h3>
            <p>Expansão de visão tecnológica.</p>
          </div>
        </div>

        <div className="hobby-card">
          <img src={capa5} alt="Fitness Life" />
          <div className="hobby-content">
            <span className="hobby-category">Lifestyle</span>
            <h3>Fitness & Strength</h3>
            <p>Saúde física como pilar para a performance cognitiva.</p>
          </div>
        </div>

        <div className="hobby-card">
          <img src={capa6} alt="Fitness Life" />
          <div className="hobby-content">
            <span className="hobby-category">Coffee</span>
            <h3>Code & coffee.</h3>
            <p>
              Convertendo cafeína em algoritmos e traços. A ciência por trás do
              grão perfeito é o combustível que move minhas madrugadas de
              criação.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Intereceses;
