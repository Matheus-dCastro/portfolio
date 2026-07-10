import { useState } from "react";
import HeadSite from "./components/HeadSite";
import Perfil from "./components/Perfil";

import "./style.css";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Contacts from "./components/Contacts";
import About from "./components/About";
import Hobbies from "./Hobbies";
import logoWolf from "./assets/img/wolf(2).png";
import fotoAlomyr from "./assets/img/alomyr.jpeg";
import cvMatheus from "./docs/Matheus Vinicius Silva Freire de Castro.pdf";

function Home({ onNavigateToHobbies }) {
  const dados = {
    nome: "Matheus",
    sobrenome: "de Castro",
    nomeCompleto: "Matheus de Castro",
  };
  const imageWolf = logoWolf;
  const descriptionPerfil =
    "IT Technician — IFRN. Undergraduate student in Information Technology (BTI) at UFRN, focusing my studies on Machine Learning and backend development.";
  const fotoPerfil = fotoAlomyr;
  const cv = cvMatheus;
  const expData = [
    {
      title: "IT Intern",
      company: "Detran",
      time: "Junho 2026 - Atual",
      bullets: ["Em andamento"],
    },
    {
      title: "IT Intern",
      company: "Cachina Soluções",
      time: "Março 2026 - Atualmente",
      bullets: [
        "Desenvolvimento e otimização de arquiteturas de backend;",
        "Automação de fluxos de trabalho inteligentes utilizando n8n integrados a ecossistemas digitais;",
        "Gerenciamento ágil de servidores Linux (Ubuntu Server) e documentação técnica de processos operacionais;",
        "Principais tecnologias utilizadas: Python, SQL, n8n, Linux, Bash e Git.",
      ],
    },
    {
      title: "IT Technician Training",
      company: "UFRN Campus Natal",
      time: "2024 - Atual",
      bullets: [
        "Foco em desenvolvimento de Software e machine learning, em construção...",
      ],
    },
    {
      title: "IT Technician Training",
      company: "IFRN Campus Lajes",
      time: "2019 - 2022",
      bullets: [
        "Formação técnica integrada estruturada com foco em Desenvolvimento web;",
        "Desenvolvimento de lógica algorítmica sólida e fundamentos de bancos de dados relacionais;",
        "Práticas de laboratório envolvendo montagem, manutenção e implantação de arquiteturas operacionais locais.",
      ],
    },
  ];
  const descriptionP1About =
    "I am an Information Technology (BTI) student at UFRN, specializing in building robust back-end architectures and processing intelligent pipelines. I bridge the mathematical rigor of <strong>Machine Learning Engineering</strong> with the clean aesthetic execution of software architecture.";
  const descriptionP2About =
    " With practical experience in automated workflows, and relational data structures, I scale code with the same milimetric precision I apply to hyperrealism drawings. Studying to become a machine learning engineer";
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
      <body>
        <main>
          <HeadSite
            nome={dados.nome}
            sobrenome={dados.sobrenome}
            lobo={imageWolf}
            description={descriptionPerfil}
          />{" "}
          <Perfil
            nomeCompleto={dados.nomeCompleto}
            description={descriptionPerfil}
            foto={fotoPerfil}
            cv={cv}
          />
          <section id="skills" className="skills-section">
            <Skills />
          </section>
          <section id="experience" className="experience-section">
            <Experience expData={expData} />
          </section>
          <section id="projects" className="Projects-section">
            <Projects />
          </section>
          <section id="about" class="about-section">
            <About
              descriptionP1={descriptionP1About}
              descriptionP2={descriptionP2About}
              onAction={onNavigateToHobbies}
            />
          </section>
        </main>
        <section id="contact" class="contact-section">
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
      </body>
    </>
  );
}

export default Home;
