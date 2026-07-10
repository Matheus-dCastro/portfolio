function HeadSite({
  nome = "Matheus",
  sobrenome = "de Castro",
  lobo = "src/assets/img/wolf(2).png",
  isHobbies = false,
}) {
  return (
    <header>
      <a href={isHobbies ? "index.html" : "#"} className="logo">
        <img src={lobo} className="logo-icon" alt="Lobo" />
        <span className="className-name">{nome}</span>
        <span className="last-name">{sobrenome}</span>
      </a>

      <nav>
        {isHobbies ? (
          <>
            <a href="index.html">Home</a>
            <a href="index.html#projects">Works</a>
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
