import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../context/useLanguage";

function HeadSite({
  nome = "Matheus",
  sobrenome = "de Castro",
  lobo = "./assets/img/wolf(2).png",
  isHobbies = false,
  isLinks = false,
  onBackToHome,
  onNavigateToLinks,
}) {
  const { t } = useLanguage();

  const handleLogoClick = (e) => {
    if (isHobbies || isLinks) {
      e.preventDefault();
      onBackToHome();
    }
  };

  const handleLinksClick = (e) => {
    if (onNavigateToLinks) {
      e.preventDefault();
      onNavigateToLinks();
    }
  };

  return (
    <header className="site-header">
      <a
        href={(isHobbies || isLinks) ? "#" : "#"}
        onClick={handleLogoClick}
        className="logo"
      >
        <img src={lobo} className="logo-icon" alt="Lobo" />
        <span className="first-name">{nome}</span>{" "}
        <span className="last-name">{sobrenome}</span>
      </a>

      <nav>
        {isLinks ? (
          <>
            <a href="#" onClick={handleLogoClick}>
              {t("nav.home")}
            </a>
          </>
        ) : isHobbies ? (
          <>
            <a href="#" onClick={handleLogoClick}>
              {t("nav.home")}
            </a>
            <a href="/#projects">{t("nav.works")}</a>
            <a href="#interests">{t("nav.interests")}</a>
            <a href="#art-gallery">{t("nav.arts")}</a>
            <a href="#thoughts">{t("nav.thoughts")}</a>
          </>
        ) : (
          <>
            <a href="#experience">{t("nav.experience")}</a>
            <a href="#skills">{t("nav.skills")}</a>
            <a href="#projects">{t("nav.works")}</a>
            <a href="#about">{t("nav.about")}</a>
            <a href="#" onClick={handleLinksClick} className="connect-link">
              {t("nav.connect")}
            </a>
          </>
        )}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}

export default HeadSite;
