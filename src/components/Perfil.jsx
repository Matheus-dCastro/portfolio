import { useState, useEffect } from "react";

function Perfil({ nomeCompleto, description, foto, cv }) {
  const frases = [
    "Matheus de Castro",
    // "Backend Developer",
    // "Machine Learning Student",
  ];

  const [textoAtual, setTextoAtual] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeSpeed, setTypeSpeed] = useState(150);

  useEffect(() => {
    const currentPhrase = frases[phraseIndex];

    const isSpecialPhrase = currentPhrase === "Backend Developer";

    const handleTyping = () => {
      if (!isDeleting) {
        setTextoAtual(currentPhrase.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
        setTypeSpeed(150);

        if (charIndex + 1 === currentPhrase.length) {
          setTypeSpeed(2000);
          setIsDeleting(true);
        }
      } else {
        setTextoAtual(currentPhrase.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
        setTypeSpeed(80);

        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % frases.length);
          setTypeSpeed(500);
        }
      }
    };

    const timer = setTimeout(handleTyping, typeSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, typeSpeed]);

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="profile-wrapper">
          <img src={foto} alt={nomeCompleto} className="profile-pic" />
        </div>

        <h1 className="typewriter-text">
          {phraseIndex === 1 && isDeleting === false ? (
            <span className="outline">{textoAtual}</span>
          ) : (
            textoAtual
          )}
        </h1>

        <p className="hero-subtitle">{description}</p>

        <div className="btn-group">
          <a href="#projects" className="btn">
            See My Projects
          </a>
          <a
            href={cv}
            target="_blank"
            className="btn btn-outline"
            rel="noreferrer"
          >
            Download CV
          </a>
        </div>
      </div>

      <div className="card-container">
        <div className="split-card">
          <div className="side design">ART</div>
          <div className="side coder">CODER IS</div>
        </div>
      </div>
    </section>
  );
}

export default Perfil;
