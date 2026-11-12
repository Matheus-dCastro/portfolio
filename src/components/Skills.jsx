import { useLanguage } from "../context/useLanguage";

function Skills() {
  const { t } = useLanguage();

  return (
    <>
      <div className="section-divider-line"></div>
      <p className="section-tag">{t("skills.tag")}</p>
      <h2>
        {t("skills.title_prefix")}<span>{t("skills.title_highlight")}</span>
      </h2>
      <div className="skills-grid">
        <div className="skill-item">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
            alt="Python"
          />
          <span>Python</span>
        </div>
        <div className="skill-item">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg"
            alt="Java"
          />
          <span>Java</span>
        </div>
        <div className="skill-item">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg"
            alt="C++"
          />
          <span>C++</span>
        </div>
        <div className="skill-item">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"
            alt="PostgreSQL"
          />
          <span>PostgreSQL</span>
        </div>
        <div className="skill-item">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-plain.svg"
            alt="Ubuntu"
          />
          <span>Ubuntu</span>
        </div>
        <div className="skill-item">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"
            alt="Git"
          />
          <span>Git</span>
        </div>
        <div className="skill-item">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg"
            alt="VS Code"
          />
          <span>VS Code</span>
        </div>
        <div className="skill-item">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg"
            alt="HTML5"
          />
          <span>HTML5</span>
        </div>
        <div className="skill-item">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"
            alt="CSS3"
          />
          <span>CSS3</span>
        </div>
        <div className="skill-item">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/markdown/markdown-original.svg"
            alt="Markdown"
          />
          <span>Markdown</span>
        </div>
        <div className="skill-item focus-study">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg"
            alt="C#"
          />
          <span>C#</span>
        </div>
        <div className="skill-item focus-study">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
            alt="JS"
          />
          <span>JavaScript</span>
        </div>
        <div className="skill-item focus-study">
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
            alt="TypeScript"
          />
          <span>TypeScript</span>
        </div>
      </div>

      <div className="frameworks-wrapper" style={{ marginTop: "60px" }}>
        <p className="section-tag">{t("skills.frameworks_tag")}</p>
        <h2>
          {t("skills.frameworks_title_prefix")}<span>{t("skills.frameworks_title_highlight")}</span>
        </h2>
        <div className="skills-grid">
          <div className="skill-item">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg"
              alt="FastAPI"
            />
            <span>FastAPI</span>
          </div>
          <div className="skill-item">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg"
              alt="Spring Boot"
            />
            <span>Spring Boot</span>
          </div>
          <div className="skill-item">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg"
              alt="PyTorch"
            />
            <span>PyTorch</span>
          </div>
          <div className="skill-item">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scikitlearn/scikitlearn-original.svg"
              alt="Scikit-Learn"
            />
            <span>Scikit-Learn</span>
          </div>
          <div className="skill-item">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg"
              alt="Pandas"
            />
            <span>Pandas</span>
          </div>
          <div className="skill-item">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg"
              alt="NumPy"
            />
            <span>NumPy</span>
          </div>
          <div className="skill-item focus-study">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg"
              alt=".NET"
            />
            <span>.NET</span>
          </div>
          <div className="skill-item focus-study">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg"
              alt="ASP.NET"
            />
            <span>ASP.NET</span>
          </div>
          <div className="skill-item focus-study">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
              alt="React"
            />
            <span>React.js</span>
          </div>
          <div className="skill-item focus-study">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg"
              alt="Vite"
            />
            <span>Vite</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Skills;
