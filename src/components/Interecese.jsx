import { useLanguage } from "../context/useLanguage";

function Intereceses({ mensagem, capa1, capa2, capa3, capa4, capa5, capa6 }) {
  const { t } = useLanguage();

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
        <div className="hobby-card tall">
          <img src={capa1} alt="Art" />
          <div className="hobby-content">
            <span className="hobby-category">Art</span>
            <h3>{t("hobbies.card_art_title")}</h3>
            <p>{t("hobbies.card_art_desc")}</p>
          </div>
        </div>

        <div className="hobby-card wide">
          <img src={capa2} alt="Gaming" />
          <div className="hobby-content">
            <span className="hobby-category">Gaming</span>
            <h3>{t("hobbies.card_gaming_title")}</h3>
            <p>{t("hobbies.card_gaming_desc")}</p>
          </div>
        </div>

        <div className="hobby-card">
          <img src={capa3} alt="AI & ML" />
          <div className="hobby-content">
            <span className="hobby-category">Future</span>
            <h3>{t("hobbies.card_future_title")}</h3>
            <p>{t("hobbies.card_future_desc")}</p>
          </div>
        </div>

        <div className="hobby-card">
          <img src={capa4} alt="Reading" />
          <div className="hobby-content">
            <span className="hobby-category">Reading</span>
            <h3>{t("hobbies.card_reading_title")}</h3>
            <p>{t("hobbies.card_reading_desc")}</p>
          </div>
        </div>

        <div className="hobby-card">
          <img src={capa5} alt="Fitness Life" />
          <div className="hobby-content">
            <span className="hobby-category">Lifestyle</span>
            <h3>{t("hobbies.card_fitness_title")}</h3>
            <p>{t("hobbies.card_fitness_desc")}</p>
          </div>
        </div>

        <div className="hobby-card">
          <img src={capa6} alt="Coffee" />
          <div className="hobby-content">
            <span className="hobby-category">Coffee</span>
            <h3>{t("hobbies.card_coffee_title")}</h3>
            <p>{t("hobbies.card_coffee_desc")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Intereceses;
