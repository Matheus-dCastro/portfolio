import { useLanguage } from "../context/useLanguage";

function Rodape({ ano, github_link, linkedin_link }) {
  const { t } = useLanguage();

  return (
    <>
      <p>© {ano} {t("footer.rights")}</p>
      <div className="footer-links">
        <a href={github_link} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href={linkedin_link} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      </div>
    </>
  );
}

export default Rodape;
