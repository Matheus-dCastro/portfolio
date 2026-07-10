function Rodape({ ano, github_link, linkedin_link }) {
  return (
    <>
      <p>© {ano} Matheus de Castro. Built with code & coffee.</p>
      <div class="footer-links">
        <a href={github_link} target="_blank">
          GitHub
        </a>
        <a href={linkedin_link} target="_blank">
          LinkedIn
        </a>
      </div>
    </>
  );
}

export default Rodape;
