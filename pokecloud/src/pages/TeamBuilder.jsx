import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveTeam, getTeams, deleteTeam, updateTeam } from "../api";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  padding: "1rem",
  width: "180px",
  textAlign: "center",
  margin: "0.5rem",
};

const typeBadgeStyle = {
  display: "inline-block",
  padding: "0.2rem 0.6rem",
  margin: "0 0.2rem",
  borderRadius: "9999px",
  fontSize: "0.8rem",
  color: "#fff",
};

export default function TeamBuilder() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState([]);
  const [savedTeams, setSavedTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setSavedTeams([]);
      setTeam([]);
      setTeamName("");
      return;
    }

    const loadTeams = async () => {
      try {
        const res = await getTeams(user.uid);
        const teams = res?.data ?? [];
        setSavedTeams(teams);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      }
    };

    loadTeams();
  }, [user]);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setSearchError("");
    setSearchResult(null);

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
      if (!res.ok) throw new Error("Pokémon not found");
      const data = await res.json();

      const pokemon = {
        name: data.name,
        types: data.types.map((t) => t.type.name),
        sprite: data.sprites.front_default,
      };
      setSearchResult(pokemon);
    } catch (error) {
      setSearchError(error.message);
    }
  };

  const addToTeam = (pokemon) => {
    if (team.length >= 6) return alert("Team is full! Max 6 Pokémon.");
    if (team.find((p) => p.name === pokemon.name)) return alert("Already in team!");
    setTeam([...team, pokemon]);
    setSearchResult(null);
    setSearchTerm("");
  };

  const removeFromTeam = (name) => {
    setTeam(team.filter((p) => p.name !== name));
  };

  const handleSaveTeam = async () => {
    if (!user) return alert("Please log in to save your team.");
    if (!teamName) return alert("Enter a team name.");
    if (team.length === 0) return alert("Add at least one Pokémon to your team.");

    const teamData = {
      userId: user.uid,
      teamName,
      pokemons: team.map((p) => p.name),
    };

    try {
      await saveTeam(teamData);
      alert("Team saved successfully!");
      setTeamName("");
      setTeam([]);
      const res = await getTeams(user.uid);
      setSavedTeams(res?.data ?? []);
    } catch (err) {
      console.error("Error saving team", err);
      alert("Failed to save team.");
    }
  };

  const handleDelete = async (teamId) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    try {
      await deleteTeam(user.uid, teamId);
      const res = await getTeams(user.uid);
      setSavedTeams(res?.data ?? []);
    } catch (err) {
      console.error("Failed to delete team", err);
    }
  };

  const handleRename = async (teamId, newName) => {
    if (!user) return;
    try {
      await updateTeam(user.uid, teamId, { teamName: newName });
      const res = await getTeams(user.uid);
      setSavedTeams(res?.data ?? []);
    } catch (err) {
      console.error("Failed to rename team", err);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center", color: "#ef233c" }}>🛠️ Build Your Pokémon Team</h1>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter your team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          style={{ padding: "0.5rem 1rem", fontSize: "1rem", borderRadius: "8px", border: "1px solid #ccc", width: "300px" }}
        />
      </div>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Search Pokémon by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ padding: "0.5rem 1rem", fontSize: "1rem", borderRadius: "8px", border: "1px solid #ccc", width: "250px" }}
        />
        <button
          onClick={handleSearch}
          style={{ marginLeft: "1rem", padding: "0.5rem 1rem", fontSize: "1rem", borderRadius: "8px", border: "none", backgroundColor: "#0077b6", color: "white", cursor: "pointer" }}
        >
          Search
        </button>
      </div>

      {searchError && <p style={{ color: "red", textAlign: "center" }}>{searchError}</p>}

      {searchResult && (
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <motion.div style={cardStyle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <img src={searchResult.sprite} alt={searchResult.name} width={100} />
            <h3 style={{ margin: "0.5rem 0", color: "#023047" }}>{searchResult.name.toUpperCase()}</h3>
            <div>
              {searchResult.types.map((type) => (
                <span key={type} style={{ ...typeBadgeStyle, backgroundColor: getTypeColor(type) }}>{type}</span>
              ))}
            </div>
            <button onClick={() => addToTeam(searchResult)} style={{ marginTop: "1rem", backgroundColor: "#2a9d8f", border: "none", color: "white", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer" }}>Add to Team</button>
          </motion.div>
        </div>
      )}

      <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "#023047" }}>Your Team ({team.length}/6)</h2>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", minHeight: "220px", backgroundColor: "#f1faee", borderRadius: "12px", padding: "1rem", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        <AnimatePresence>
          {team.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: "100%", textAlign: "center", color: "#999" }}>Your team is empty! Search for Pokémon above to add it.</motion.p>
          )}
          {team.map((p) => (
            <motion.div key={p.name} style={cardStyle} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <img src={p.sprite} alt={p.name} width={100} />
              <h3 style={{ margin: "0.5rem 0", color: "#023047" }}>{p.name.toUpperCase()}</h3>
              <div>
                {p.types.map((type) => (
                  <span key={type} style={{ ...typeBadgeStyle, backgroundColor: getTypeColor(type) }}>{type}</span>
                ))}
              </div>
              <button onClick={() => removeFromTeam(p.name)} style={{ marginTop: "1rem", backgroundColor: "#ef233c", border: "none", color: "white", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer" }}>Remove</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button onClick={handleSaveTeam} disabled={!user} style={{ backgroundColor: user ? "#0077b6" : "#ccc", color: "white", border: "none", padding: "0.75rem 2rem", borderRadius: "8px", fontSize: "1.1rem", cursor: user ? "pointer" : "not-allowed" }}>Save Team</button>
        {!user && <p style={{ color: "red", marginTop: "0.5rem" }}>Please log in to save your team.</p>}
      </div>

      {user && savedTeams.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <h2 style={{ textAlign: "center", color: "#023047" }}>📁 Your Saved Teams</h2>
          {savedTeams.map((t) => (
            <div key={t.id} style={{ backgroundColor: "#fefae0", margin: "1rem auto", padding: "1rem", borderRadius: "10px", maxWidth: "600px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <input
                type="text"
                value={t.teamName}
                onChange={(e) => handleRename(t.id, e.target.value)}
                style={{ width: "60%", padding: "0.5rem", marginBottom: "0.5rem", fontWeight: "bold", fontSize: "1rem" }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                {t.pokemons.map((name) => (
                  <img key={name} src={`https://img.pokemondb.net/sprites/home/normal/${name}.png`} alt={name} width={60} height={60} style={{ borderRadius: "8px", background: "#fff" }} />
                ))}
              </div>
              <button onClick={() => handleDelete(t.id)} style={{ backgroundColor: "#ef233c", color: "white", border: "none", padding: "0.4rem 1rem", borderRadius: "6px", cursor: "pointer" }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getTypeColor(type) {
  const colors = {
    fire: "#f94144",
    water: "#277da1",
    grass: "#43aa8b",
    electric: "#f9c74f",
    poison: "#9d4edd",
    flying: "#90be6d",
    default: "#adb5bd",
  };
  return colors[type] || colors.default;
}
