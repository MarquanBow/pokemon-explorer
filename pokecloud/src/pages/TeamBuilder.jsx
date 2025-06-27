// src/pages/TeamBuilder.jsx
import { useState } from "react";

export default function TeamBuilder() {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState(null);
  const [team, setTeam] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setPokemon(null);

    if (!query) return;

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
      if (!res.ok) throw new Error("Pokémon not found");
      const data = await res.json();
      setPokemon(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const addToTeam = () => {
    if (team.length >= 6) {
      setError("You can only have 6 Pokémon on a team.");
      return;
    }
    if (team.find(p => p.name === pokemon.name)) {
      setError("This Pokémon is already on your team.");
      return;
    }
    setTeam([...team, pokemon]);
    setPokemon(null);
    setQuery("");
  };

  const removeFromTeam = (name) => {
    setTeam(team.filter(p => p.name !== name));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Build Your Pokémon Team</h1>

      <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search for Pokémon..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "0.5rem", width: "250px", marginRight: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>Search</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {pokemon && (
        <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "10px", marginBottom: "1rem" }}>
          <h3>{pokemon.name.toUpperCase()}</h3>
          <img src={pokemon.sprites.front_default} alt={pokemon.name} width="100" />
          <button onClick={addToTeam} style={{ marginTop: "0.5rem", padding: "0.5rem 1rem" }}>
            Add to Team
          </button>
        </div>
      )}

      <h2>Your Team ({team.length}/6)</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {team.map((p) => (
          <div key={p.name} style={{ border: "1px solid #aaa", padding: "1rem", borderRadius: "10px", width: "120px", textAlign: "center" }}>
            <img src={p.sprites.front_default} alt={p.name} width="80" />
            <p>{p.name.toUpperCase()}</p>
            <button onClick={() => removeFromTeam(p.name)} style={{ fontSize: "0.8rem", padding: "0.3rem 0.5rem" }}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
