import { useState, useEffect } from "react";
import Home from "./Home";
import Hobbies from "./Hobbies";
import Links from "./Links";
import AdminDraft from "./components/AdminDraft";
import ViewDraft from "./components/ViewDraft";
import OrderDraft from "./components/OrderDraft";
import LoginDraft from "./components/LoginDraft";
import NotFound from "./components/NotFound";
import BlogGateway from "./components/BlogGateway";
import BlogPage from "./components/BlogPage";
import ChatWidget from "./components/ChatWidget";
import { getStoredProjects, getStoredArticles, getStoredThoughts } from "./data/projectsData";
import { getCurrentUser, onAuthChange, isAuthorizedAdmin } from "./lib/supabaseService";

function App() {
  const [selectedProject, setSelectedProject] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("project") || urlParams.get("id");
    if (projectId) {
      const all = [
        ...getStoredProjects(),
        ...getStoredArticles(),
        ...getStoredThoughts()
      ];
      return all.find((p) => p.id === projectId) || null;
    }
    return null;
  });

  const [selectedBlogPostId, setSelectedBlogPostId] = useState(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("post") || null;
    }
    return null;
  });

  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      // Se vier de autenticação OAuth com access_token na hash ou redirecionamento com /#
      if (hash.includes("access_token") || hash.includes("refresh_token") || hash === "#" || hash === "#/") {
        window.history.replaceState({}, "", "/4dm1n");
        return "admin";
      }
      const rawPath = window.location.pathname.replace(/\/$/, "");
      if (rawPath.includes("/404")) {
        return "not-found";
      }
      if (rawPath.includes("/l0g1n") || rawPath.includes("/login")) {
        return "login";
      }
      if (rawPath.includes("/4dm1n")) {
        return "admin";
      }
      if (rawPath.includes("/draft-view")) {
        return "view-draft";
      }
      if (rawPath.includes("/draft-order")) {
        return "order-draft";
      }
      if (rawPath.includes("/contacts")) {
        return "links";
      }
      if (rawPath.includes("/blog/alomyr")) {
        return "blog-alomyr";
      }
      if (rawPath.endsWith("/blog") || rawPath.endsWith("/blog/")) {
        if (window.location.search === "?" || window.location.search.includes("gateway")) {
          return "blog-gateway";
        }
        return "blog-tech";
      }
      if (rawPath.includes("/blog")) {
        return "blog-tech";
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
      if (page === "blog-gateway" || page === "gateway") {
        return "blog-gateway";
      }
      if (page === "blog-tech" || page === "blog") {
        return "blog-tech";
      }
      if (page === "blog-alomyr") {
        return "blog-alomyr";
      }
      if (rawPath !== "" && rawPath !== "/" && rawPath !== "/index.html") {
        return "not-found";
      }
    }
    return "home";
  });

  const [returnToAdmin, setReturnToAdmin] = useState(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("from") === "admin";
    }
    return false;
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });

    const sub = onAuthChange((event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      setAuthChecked(true);

      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && user) {
        const hash = window.location.hash || "";
        const isOAuthCallback = hash.includes("access_token") || hash.includes("refresh_token") || hash === "#" || hash === "#/";
        const isLoginPage = window.location.pathname.includes("/l0g1n") || window.location.pathname.includes("/login");

        if (isLoginPage || isOAuthCallback) {
          if (isAuthorizedAdmin(user)) {
            setCurrentPage("admin");
            window.history.replaceState({}, "", "/4dm1n");
          }
        }
      } else if (event === "SIGNED_OUT") {
        if (currentPage === "admin" || currentPage === "order-draft") {
          setCurrentPage("login");
          window.history.pushState({}, "", "/l0g1n");
        }
      }
    });

    return () => {
      if (sub?.unsubscribe) sub.unsubscribe();
    };
  }, [currentPage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const rawPath = window.location.pathname.replace(/\/$/, "");
      if (rawPath.includes("/404")) {
        setCurrentPage("not-found");
        return;
      }
      if (rawPath.includes("/l0g1n") || rawPath.includes("/login")) {
        setCurrentPage("login");
        return;
      }
      if (rawPath.includes("/4dm1n")) {
        setCurrentPage("admin");
        return;
      }
      if (rawPath.includes("/draft-view")) {
        setCurrentPage("view-draft");
        return;
      }
      if (rawPath.includes("/draft-order")) {
        setCurrentPage("order-draft");
        return;
      }
      if (rawPath.includes("/contacts")) {
        setCurrentPage("links");
        return;
      }
      if (rawPath.includes("/blog/alomyr")) {
        setCurrentPage("blog-alomyr");
        const post = urlParams.get("post");
        setSelectedBlogPostId(post || null);
        return;
      }
      if (rawPath.includes("/blog")) {
        if (window.location.search === "?" || window.location.search.includes("gateway")) {
          setCurrentPage("blog-gateway");
          return;
        }
        setCurrentPage("blog-tech");
        const post = urlParams.get("post");
        setSelectedBlogPostId(post || null);
        return;
      }
      const urlParams = new URLSearchParams(window.location.search);
      const projId = urlParams.get("project");
      if (projId) {
        const all = [
          ...getStoredProjects(),
          ...getStoredArticles(),
          ...getStoredThoughts()
        ];
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
      } else if (page === "blog-gateway" || page === "gateway") {
        setCurrentPage("blog-gateway");
      } else if (page === "blog-tech" || page === "blog") {
        setCurrentPage("blog-tech");
        const post = urlParams.get("post");
        setSelectedBlogPostId(post || null);
      } else if (page === "blog-alomyr") {
        setCurrentPage("blog-alomyr");
        const post = urlParams.get("post");
        setSelectedBlogPostId(post || null);
      } else if (rawPath !== "" && rawPath !== "/" && rawPath !== "/index.html") {
        setCurrentPage("not-found");
      } else {
        setCurrentPage("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigateToBlogGateway = () => {
    setCurrentPage("blog-gateway");
    window.history.pushState({}, "", "/blog/?");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectBlogChannel = (chan) => {
    if (chan === "alomyr") {
      setCurrentPage("blog-alomyr");
      setSelectedBlogPostId(null);
      window.history.pushState({}, "", "/blog/alomyr");
    } else {
      setCurrentPage("blog-tech");
      setSelectedBlogPostId(null);
      window.history.pushState({}, "", "/blog");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenBlogPost = (post) => {
    const chan = post.channel || "tech";
    if (chan === "alomyr") {
      setCurrentPage("blog-alomyr");
      setSelectedBlogPostId(post.id);
      window.history.pushState({}, "", `/blog/alomyr?post=${encodeURIComponent(post.id)}`);
    } else {
      setCurrentPage("blog-tech");
      setSelectedBlogPostId(post.id);
      window.history.pushState({}, "", `/blog?post=${encodeURIComponent(post.id)}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenProject = (project, fromAdmin = false) => {
    setSelectedProject(project);
    const isFromAdmin = fromAdmin || currentPage === "admin" || window.location.pathname.includes("/4dm1n");
    if (isFromAdmin) {
      setReturnToAdmin(true);
    }
    setCurrentPage("project-detail");
    window.history.pushState(
      { project: project.id, fromAdmin: isFromAdmin },
      "",
      `/?project=${encodeURIComponent(project.id)}${isFromAdmin ? "&from=admin" : ""}`
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToHome = (targetSection = null) => {
    if (returnToAdmin || (typeof window !== "undefined" && window.location.search.includes("from=admin"))) {
      setReturnToAdmin(false);
      setCurrentPage("admin");
      window.history.pushState({}, "", "/4dm1n");
      return;
    }
    if (targetSection === "thoughts") {
      setCurrentPage("hobbies");
      window.history.pushState({}, "", "/?page=hobbies#thoughts");
      setTimeout(() => {
        const el = document.getElementById("thoughts");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 60);
      return;
    }
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
      setTimeout(() => {
        const isArticle = selectedProject?.relatedProjectId || selectedProject?.id?.startsWith("art-");
        const targetId = targetSection || (isArticle ? "articles" : "projects");
        const targetEl = document.getElementById(targetId) || document.getElementById("projects");
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 60);
    }
  };

  if (currentPage === "blog-gateway") {
    return (
      <>
        <BlogGateway
          onSelectChannel={handleSelectBlogChannel}
          onBackToHome={() => {
            setCurrentPage("home");
            window.history.pushState({}, "", "/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
        <ChatWidget />
      </>
    );
  }

  if (currentPage === "blog-tech") {
    return (
      <>
        <BlogPage
          channel="tech"
          initialPostId={selectedBlogPostId}
          onBackToHome={() => {
            setCurrentPage("home");
            window.history.pushState({}, "", "/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateToGateway={handleNavigateToBlogGateway}
          onSwitchChannel={(newChan) => handleSelectBlogChannel(newChan)}
          onOpenProject={handleOpenProject}
        />
        <ChatWidget />
      </>
    );
  }

  if (currentPage === "blog-alomyr") {
    return (
      <>
        <BlogPage
          channel="alomyr"
          initialPostId={selectedBlogPostId}
          onBackToHome={() => {
            setCurrentPage("home");
            window.history.pushState({}, "", "/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onNavigateToGateway={handleNavigateToBlogGateway}
          onSwitchChannel={(newChan) => handleSelectBlogChannel(newChan)}
          onOpenProject={handleOpenProject}
        />
        <ChatWidget />
      </>
    );
  }

  if (currentPage === "hobbies") {
    return (
      <>
        <Hobbies
          onBackToHome={handleBackToHome}
          onOpenThought={handleOpenProject}
          onNavigateToBlog={handleNavigateToBlogGateway}
        />
        <ChatWidget />
      </>
    );
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
    // Bloqueia acesso a usuários não autenticados ou não autorizados
    if (authChecked && (!currentUser || !isAuthorizedAdmin(currentUser))) {
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
    if (authChecked && (!currentUser || !isAuthorizedAdmin(currentUser))) {
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
      <>
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
          onNavigateToBlogPost={handleOpenBlogPost}
        />
        <ChatWidget />
      </>
    );
  }

  if (currentPage === "not-found") {
    return (
      <>
        <NotFound
          onBackToHome={() => {
            setCurrentPage("home");
            window.history.pushState({}, "", "/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onExploreWorks={() => {
            setCurrentPage("home");
            window.history.pushState({}, "", "/#works");
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => {
              const el = document.getElementById("works");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 150);
          }}
        />
        <ChatWidget />
      </>
    );
  }

  return (
    <>
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
        onNavigateToBlog={handleNavigateToBlogGateway}
        onNavigateToBlogPost={handleOpenBlogPost}
      />
      <ChatWidget />
    </>
  );
}

export default App;
