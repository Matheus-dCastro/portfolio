import { useState } from "react";
import Home from "./Home";
import Hobbies from "./Hobbies";
import Links from "./Links";

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page");
    if (page === "links" || page === "hobbies") {
      return page;
    }
    return "home";
  });

  if (currentPage === "hobbies") {
    return <Hobbies onBackToHome={() => setCurrentPage("home")} />;
  }

  if (currentPage === "links") {
    return <Links onBackToHome={() => setCurrentPage("home")} />;
  }

  return (
    <Home
      onNavigateToHobbies={() => setCurrentPage("hobbies")}
      onNavigateToLinks={() => setCurrentPage("links")}
      onBackToHome={() => setCurrentPage("home")}
    />
  );
}

export default App;
