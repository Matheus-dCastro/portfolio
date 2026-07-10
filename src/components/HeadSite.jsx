function HeadSite({
  nome = "Matheus",
  sobrenome = "de Castro",
  lobo = "./assets/img/wolf(2).png",
  isHobbies = false,
  onBackToHome,
}) {
  const handleLogoClick = (e) => {
    if (isHobbies) {
      e.preventDefault();
      onBackToHome();
    }
  };

  return (
    <header>
      <a
        href={isHobbies ? "#" : "#"}
        onClick={handleLogoClick}
        className="logo"
      >
        <img src={lobo} className="logo-icon" alt="Lobo" />
        <span className="first-name">{nome}</span>{" "}
        <span className="last-name">{sobrenome}</span>
      </a>

      <nav>
        {isHobbies ? (
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
          </>
        )}
      </nav>
    </header>
  );
}

export default HeadSite;
