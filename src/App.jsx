import { useState } from "react";
import Home from "./Home";
import Hobbies from "./Hobbies";

function App() {
  // Estado que define qual página renderizar: 'home' ou 'hobbies'
  const [currentPage, setCurrentPage] = useState("home");

  // Se o estado for 'hobbies', renderiza a página de Hobbies
  if (currentPage === "hobbies") {
    return <Hobbies onNavigate={() => setCurrentPage("home")} />;
  }

  // Caso contrário, renderiza a Home normal, passando a função para abrir os hobbies
  return <Home onNavigateToHobbies={() => setCurrentPage("hobbies")} />;
}

export default App;
