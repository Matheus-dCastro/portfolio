function HeadSite({
  nome = "Matheus",
  sobrenome = "de Castro",
  lobo = "./assets/img/wolf(2).png",
  isHobbies = false,
  isLinks = false,
  onBackToHome,
  onNavigateToLinks,
}) {
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
    <header>
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
              Home
            </a>
          </>
        ) : isHobbies ? (
          <>
            <a href="#" onClick={handleLogoClick}>
              Home
            </a>
            <a href="index.html#projects">Works</a>
            <a href="#interests">Intereces</a>
            <a href="#art-gallery">Arts</a>
          </>
        ) : (
          <>
            <a href="#experience">Experiência</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Works</a>
            <a href="#about">About</a>
            <a href="#" onClick={handleLinksClick} className="connect-link">Conecte-se</a>
          </>
        )}
      </nav>
    </header>
  );
}

export default HeadSite;
