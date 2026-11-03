import { useState, useEffect } from "react";
import Home from "./Home";
import Hobbies from "./Hobbies";
import Links from "./Links";
import AdminDraft from "./components/AdminDraft";
import ViewDraft from "./components/ViewDraft";
import OrderDraft from "./components/OrderDraft";
import LoginDraft from "./components/LoginDraft";
import { getStoredProjects } from "./data/projectsData";

function App() {
  const [selectedProject, setSelectedProject] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("project") || urlParams.get("id");
    if (projectId) {
      const all = getStoredProjects();
      return all.find((p) => p.id === projectId) || null;
    }
    return null;
  });

  const [currentPage, setCurrentPage] = useState(() => {
    if (window.location.pathname.includes("/l0g1n") || window.location.pathname.includes("/login")) {
      return "login";
    }
    if (window.location.pathname.includes("/4dm1n")) {
      return "admin";
    }
    if (window.location.pathname.includes("/draft-view")) {
      return "view-draft";
    }
    if (window.location.pathname.includes("/draft-order")) {
      return "order-draft";
    }
    if (window.location.pathname.includes("/contacts")) {
      return "links";
    }
    const urlParams = new URLSearchParams(window.location.search);
    const project = urlParams.get("project");
    if (project) {
      return "project-detail";
    }
    const page = urlParams.get("page");
    if (page === "links" || page === "hobbies") {
      return page;
    }
    return "home";
  });

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const projId = urlParams.get("project");
      if (projId) {
        const all = getStoredProjects();
        const found = all.find((p) => p.id === projId);
        if (found) {
          setSelectedProject(found);
          setCurrentPage("project-detail");
          return;
        }
      }
      const page = urlParams.get("page");
      if (page === "links" || page === "hobbies") {
        setCurrentPage(page);
      } else {
        setCurrentPage("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleOpenProject = (project) => {
    setSelectedProject(project);
    setCurrentPage("project-detail");
    window.history.pushState(
      { project: project.id },
      "",
      `/?project=${encodeURIComponent(project.id)}`
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToHome = () => {
    if (
      window.location.pathname.includes("/contacts") ||
      window.location.pathname.includes("/4dm1n") ||
      window.location.pathname.includes("/draft-view") ||
      window.location.pathname.includes("/draft-order")
    ) {
      window.location.href = "/";
    } else {
      setCurrentPage("home");
      window.history.pushState({}, "", "/");
      // If we came back from project-detail, smooth scroll to projects section
      setTimeout(() => {
        const projEl = document.getElementById("projects");
        if (projEl) {
          projEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    }
  };

  if (currentPage === "hobbies") {
    return <Hobbies onBackToHome={handleBackToHome} />;
  }

  if (currentPage === "links") {
    return <Links onBackToHome={handleBackToHome} />;
  }

  if (currentPage === "login") {
    return (
      <LoginDraft
        onBackToHome={handleBackToHome}
        onNavigateToAdmin={() => {
          setCurrentPage("admin");
          window.history.pushState({}, "", "/4dm1n");
        }}
      />
    );
  }

  if (currentPage === "admin") {
    return (
      <AdminDraft
        onBackToHome={handleBackToHome}
        onOpenProjectDetail={handleOpenProject}
        onNavigateToOrder={() => {
          setCurrentPage("order-draft");
          window.history.pushState({}, "", "/draft-order");
        }}
      />
    );
  }

  if (currentPage === "order-draft") {
    return (
      <OrderDraft
        onBackToHome={handleBackToHome}
        onOpenProjectDetail={handleOpenProject}
        onNavigateToAdmin={() => {
          setCurrentPage("admin");
          window.history.pushState({}, "", "/4dm1n");
        }}
      />
    );
  }

  if (currentPage === "view-draft" || currentPage === "project-detail") {
    return (
      <ViewDraft
        project={selectedProject}
        onBackToHome={handleBackToHome}
        onSelectProject={(proj) => {
          setSelectedProject(proj);
          window.history.pushState(
            { project: proj.id },
            "",
            `/?project=${encodeURIComponent(proj.id)}`
          );
        }}
      />
    );
  }

  return (
    <Home
      onNavigateToHobbies={() => {
        setCurrentPage("hobbies");
        window.history.pushState({}, "", "/?page=hobbies");
      }}
      onNavigateToLinks={() => {
        setCurrentPage("links");
      }}
      onBackToHome={handleBackToHome}
      onOpenProject={handleOpenProject}
    />
  );
}

export default App;
