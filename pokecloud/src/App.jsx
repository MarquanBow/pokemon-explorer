// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PokemonDetail from "./pages/PokemonDetail";
import TeamBuilder from "./pages/TeamBuilder"; 
import PokemonSearch from "./pages/PokemonSearch";
import SavedTeams from "./pages/SavedTeams";

function App() {
  return (
    <Router>
      <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokemon/:name" element={<PokemonDetail />} />
        <Route path="/team-builder" element={<TeamBuilder />}  /> 
        <Route path="/search" element={<PokemonSearch />} />
        <Route path="/teams" element={<SavedTeams />} />
      </Routes>
      </Layout>
    </Router>
  );
}

export default App;
