import React, { useEffect } from "react";
import HeadSite from "./components/HeadSite";
import logoWolf from "./assets/img/wolf(2).png";
import Intereceses from "./components/Interecese";
import Contacts from "./components/Contacts";
import Rodape from "./components/Rodape";
import ArtGallery from "./components/ArtGallery";

// Capas
import capa1 from "./assets/img/1CF53B24-759E-48D5-B0C5-9CA7349A544E.webp";
import capa2 from "./assets/img/566644515_18081743411050733_8226103790257785455_n.webp";
import capa3 from "./assets/img/575981249_18291228211272949_514477677943118836_n.webp";
import capa4 from "./assets/img/584385202_18086409646964312_3912764164389240104_n.webp";
import capa5 from "./assets/img/Gama-4.webp";
import capa6 from "./assets/img/IMG_3091.webp";
// Artes
import arte1 from "./assets/img/IMG_2998.webp";
import arte2 from "./assets/img/IMG_3111.webp";
import arte3 from "./assets/img/IMG_3112.webp";
import arte4 from "./assets/img/IMG_3114.webp";
import arte5 from "./assets/img/IMG_3107.webp";
import arte6 from "./assets/img/IMG_3285-convertido-de-jpeg.webp";
import arte7 from "./assets/img/IMG_3104.webp";
import arte8 from "./assets/img/IMG_3110.webp";
import arte9 from "./assets/img/IMG_3286-convertido-de-jpeg.webp";

function Hobbies({ onBackToHome }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const target = document.getElementById("interests");
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const mensagem =
    "Quando não estou programando, estou explorando o lado criativo da vida. 'A arte existe porque a vida não basta', Ferreira Gullar Mas pela vidaser insuficiente é que criamos arte, Matheus de Castro";

  const artDrawings = [
    { src: arte1, title: "Aquaman" },
    { src: arte2, title: "HP" },
    { src: arte3, title: "Wanda Maximoff" },
    { src: arte4, title: "The joker of joaquin phoenix" },
    { src: arte5, title: "GOT" },
    { src: arte6, title: "Jack Sparrow em tela A4" },
    { src: arte7, title: "black widow" },
    { src: arte8, title: "GOT" },
    { src: arte9, title: "geralt de rívia the witcher 3 em Tela A2" },
  ];
  const dados = {
    nome: "Matheus",
    sobrenome: "de Castro",
    nomeCompleto: "Matheus de Castro",
    ano: "2026",
  };
  const Contatos = {
    instagram: "@MatheusdCastro._",
    instagram_link: "https://www.instagram.com/matheusdcastro._/",
    github: "@Matheus-dCastro",
    github_link: "https://github.com/Matheus-dCastro",
    email: "matheus.vsf.castro.25@gmail.com",
    linkedin: "linkedin.com/in/matheus-dcastro",
    linkedin_link: "https://www.linkedin.com/in/matheus-dcastro",
  };
  return (
    <>
      <HeadSite lobo={logoWolf} isHobbies={true} onBackToHome={onBackToHome} />
      <main>
        <section id="interests">
          <Intereceses
            mensagem={mensagem}
            capa1={capa1}
            capa2={capa2}
            capa3={capa3}
            capa4={capa4}
            capa5={capa5}
            capa6={capa6}
          />
        </section>
        <section id="art-gallery">
          <ArtGallery artDrawings={artDrawings} />
        </section>
      </main>
      <section id="contact" className="contact-section">
        <Contacts
          instagram={Contatos.instagram}
          instagram_link={Contatos.instagram_link}
          github={Contatos.github}
          github_link={Contatos.github_link}
          email={Contatos.email}
          linkedin={Contatos.linkedin}
          linkedin_link={Contatos.linkedin_link}
        />
      </section>
      <footer>
        <Rodape
          ano={dados.ano}
          github_link={Contatos.github_link}
          linkedin_link={Contatos.linkedin_link}
        />
      </footer>
    </>
  );
}

export default Hobbies;
