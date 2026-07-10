function About({ descriptionP1, descriptionP2, onAction }) {
  return (
    <>
      <div className="section-divider-line"></div>
      <p className="section-tag">Introduction</p>
      <h2>
        About <span>Me</span>
      </h2>
      <div className="about-container">
        <p
          className="about-text"
          dangerouslySetInnerHTML={{ __html: descriptionP1 }}
        ></p>
        <p className="about-text text-muted">{descriptionP2}</p>

        <button onClick={onAction} className="btn btn-outline">
          Explore
        </button>
      </div>
    </>
  );
}

export default About;
