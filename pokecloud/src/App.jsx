import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PokemonDetail from "./pages/PokemonDetail";
import TeamBuilder from "./pages/TeamBuilder";
import PokemonSearch from "./pages/PokemonSearch";
import SavedTeams from "./pages/SavedTeams";
import AccountSettings from "./pages/AccountSettings";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokemon/:name" element={<PokemonDetail />} />
            <Route path="/team-builder" element={<TeamBuilder />} />
            <Route path="/search" element={<PokemonSearch />} />
            <Route path="/saved-teams" element={<SavedTeams />} />
            <Route path="/settings" element={<AccountSettings />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
