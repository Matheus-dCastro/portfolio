import { useState } from "react";
import Home from "./Home";
import Hobbies from "./Hobbies";
import Links from "./Links";

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (window.location.pathname.includes("/contacts")) {
      return "links";
    }
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page");
    if (page === "links" || page === "hobbies") {
      return page;
    }
    return "home";
  });

  const handleBackToHome = () => {
    if (window.location.pathname.includes("/contacts")) {
      window.location.href = "/";
    } else {
      setCurrentPage("home");
      window.history.pushState({}, "", "/");
    }
  };

  if (currentPage === "hobbies") {
    return <Hobbies onBackToHome={handleBackToHome} />;
  }

  if (currentPage === "links") {
    return <Links onBackToHome={handleBackToHome} />;
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
    />
  );
}

export default App;
