// src/pages/PokemonSearch.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

export default function PokemonSearch() {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState(null);
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

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Search for a Pokémon</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="e.g. pikachu"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem", width: "250px" }}
        />
        <button type="submit">Search</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {pokemon && (
        <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem", borderRadius: "10px" }}>
          <h2>{pokemon.name.toUpperCase()}</h2>
          <img src={pokemon.sprites.front_default} alt={pokemon.name} />
          <p>Types: {pokemon.types.map((t) => t.type.name).join(", ")}</p>
          <Link to={`/pokemon/${pokemon.name}`} style={{ display: "inline-block", marginTop: "0.5rem" }}>
            View Full Details →
          </Link>
        </div>
      )}
    </div>
  );
}
