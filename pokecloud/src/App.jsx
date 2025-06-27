// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import PokemonDetail from "./pages/PokemonDetail";
import TeamBuilder from "./pages/TeamBuilder"; 
import PokedexTimeline from "./pages/PokedexTimeline";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokemon/:name" element={<PokemonDetail />} />
        <Route path="/team-builder" element={<TeamBuilder />}  /> 
        <Route path="/timeline" element={<PokedexTimeline />} />
      </Routes>
    </Router>
  );
}

export default App;
