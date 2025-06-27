import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [team, setTeam] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");

  // Search Pokémon by name
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

  // Add Pokémon to team (max 6)
  const addToTeam = (pokemon) => {
    if (team.length >= 6) return alert("Team is full! Max 6 Pokémon.");
    if (team.find((p) => p.name === pokemon.name)) return alert("Already in team!");
    setTeam([...team, pokemon]);
    setSearchResult(null);
    setSearchTerm("");
  };

  // Remove Pokémon from team
  const removeFromTeam = (name) => {
    setTeam(team.filter((p) => p.name !== name));
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center", color: "#ef233c" }}>🛠️ Build Your Pokémon Team</h1>

      {/* Search */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Search Pokémon by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "250px",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          style={{
            marginLeft: "1rem",
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#0077b6",
            color: "white",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {/* Search Result */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        {searchError && <p style={{ color: "red" }}>{searchError}</p>}

        {searchResult && (
          <motion.div
            style={cardStyle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img src={searchResult.sprite} alt={searchResult.name} width={100} />
            <h3 style={{ margin: "0.5rem 0", color: "#023047" }}>{searchResult.name.toUpperCase()}</h3>
            <div>
              {searchResult.types.map((type) => (
                <span
                  key={type}
                  style={{ ...typeBadgeStyle, backgroundColor: getTypeColor(type) }}
                >
                  {type}
                </span>
              ))}
            </div>
            <button
              onClick={() => addToTeam(searchResult)}
              style={{
                marginTop: "1rem",
                backgroundColor: "#2a9d8f",
                border: "none",
                color: "white",
                borderRadius: "6px",
                padding: "0.4rem 0.8rem",
                cursor: "pointer",
              }}
            >
              Add to Team
            </button>
          </motion.div>
        )}
      </div>

      {/* Team */}
      <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "#023047" }}>
        Your Team ({team.length}/6)
      </h2>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
          minHeight: "220px",
          backgroundColor: "#f1faee",
          borderRadius: "12px",
          padding: "1rem",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        }}
      >
        <AnimatePresence>
          {team.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ width: "100%", textAlign: "center", color: "#999" }}
            >
              Your team is empty! Search for Pokémon above to add it.
            </motion.p>
          )}

          {team.map((p) => (
            <motion.div
              key={p.name}
              style={cardStyle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <img src={p.sprite} alt={p.name} width={100} />
              <h3 style={{ margin: "0.5rem 0", color: "#023047" }}>{p.name.toUpperCase()}</h3>
              <div>
                {p.types.map((type) => (
                  <span
                    key={type}
                    style={{ ...typeBadgeStyle, backgroundColor: getTypeColor(type) }}
                  >
                    {type}
                  </span>
                ))}
              </div>
              <button
                onClick={() => removeFromTeam(p.name)}
                style={{
                  marginTop: "1rem",
                  backgroundColor: "#ef233c",
                  border: "none",
                  color: "white",
                  borderRadius: "6px",
                  padding: "0.4rem 0.8rem",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
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
