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
          <svg
            role="img"
            viewBox="0 0 24 24"
            width="42"
            height="42"
            fill="#E95420"
            className="skill-tech-icon skill-ubuntu-icon"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Ubuntu</title>
            <path d="M17.61.455a3.41 3.41 0 0 0-3.41 3.41 3.41 3.41 0 0 0 3.41 3.41 3.41 3.41 0 0 0 3.41-3.41 3.41 3.41 0 0 0-3.41-3.41zM12.92.8C8.923.777 5.137 2.941 3.148 6.451a4.5 4.5 0 0 1 .26-.007 4.92 4.92 0 0 1 2.585.737A8.316 8.316 0 0 1 12.688 3.6 4.944 4.944 0 0 1 13.723.834 11.008 11.008 0 0 0 12.92.8zm9.226 4.994a4.915 4.915 0 0 1-1.918 2.246 8.36 8.36 0 0 1-.273 8.303 4.89 4.89 0 0 1 1.632 2.54 11.156 11.156 0 0 0 .559-13.089zM3.41 7.932A3.41 3.41 0 0 0 0 11.342a3.41 3.41 0 0 0 3.41 3.409 3.41 3.41 0 0 0 3.41-3.41 3.41 3.41 0 0 0-3.41-3.41zm2.027 7.866a4.908 4.908 0 0 1-2.915.358 11.1 11.1 0 0 0 7.991 6.698 11.234 11.234 0 0 0 2.422.249 4.879 4.879 0 0 1-.999-2.85 8.484 8.484 0 0 1-.836-.136 8.304 8.304 0 0 1-5.663-4.32zm11.405.928a3.41 3.41 0 0 0-3.41 3.41 3.41 3.41 0 0 0 3.41 3.41 3.41 3.41 0 0 0 3.41-3.41 3.41 3.41 0 0 0-3.41-3.41z"/>
          </svg>
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
          <svg
            role="img"
            viewBox="0 0 24 24"
            width="42"
            height="42"
            fill="#FFFFFF"
            className="skill-tech-icon skill-markdown-icon"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Markdown</title>
            <path d="M22.27 19.385H1.73A1.73 1.73 0 010 17.655V6.345a1.73 1.73 0 011.73-1.73h20.54A1.73 1.73 0 0124 6.345v11.308a1.73 1.73 0 01-1.73 1.731zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.46v7.847zM21.232 12h-2.309V8.077h-2.307V12h-2.308l3.461 4.039z"/>
          </svg>
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
