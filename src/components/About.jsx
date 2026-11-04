import { useLanguage } from "../context/useLanguage";

function About({ descriptionP1, descriptionP2, onAction }) {
  const { t } = useLanguage();

  const p1 = descriptionP1 || t("about.p1");
  const p2 = descriptionP2 || t("about.p2");

  return (
    <>
      <div className="section-divider-line"></div>
      <p className="section-tag">{t("about.tag")}</p>
      <h2>
        {t("about.title_prefix")}<span>{t("about.title_highlight")}</span>
      </h2>
      <div className="about-container">
        <p
          className="about-text"
          dangerouslySetInnerHTML={{ __html: p1 }}
        ></p>
        <p className="about-text text-muted">{p2}</p>

        <div className="about-action-buttons">
          <button onClick={onAction} className="btn btn-outline">
            {t("about.action_btn")}
          </button>
        </div>
      </div>
    </>
  );
}

export default About;
