import { useState } from "react";
import Home from "./Home";
import Hobbies from "./Hobbies";
import Links from "./Links";
import AdminDraft from "./components/AdminDraft";
import ViewDraft from "./components/ViewDraft";
import OrderDraft from "./components/OrderDraft";

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
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
    const page = urlParams.get("page");
    if (page === "links" || page === "hobbies") {
      return page;
    }
    return "home";
  });

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
    }
  };

  if (currentPage === "hobbies") {
    return <Hobbies onBackToHome={handleBackToHome} />;
  }

  if (currentPage === "links") {
    return <Links onBackToHome={handleBackToHome} />;
  }

  if (currentPage === "admin") {
    return <AdminDraft onBackToHome={handleBackToHome} />;
  }

  if (currentPage === "view-draft") {
    return <ViewDraft onBackToHome={handleBackToHome} />;
  }

  if (currentPage === "order-draft") {
    return <OrderDraft onBackToHome={handleBackToHome} />;
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
