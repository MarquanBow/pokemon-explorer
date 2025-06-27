// src/pages/Home.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState(null);
  const [error, setError] = useState("");

  const searchPokemon = async (e) => {
    e.preventDefault();
    setError("");
    setPokemon(null);

    if (!query) return;

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
      if (!res.ok) {
        throw new Error("Pokémon not found");
      }
      const data = await res.json();
      setPokemon(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>PokéCloud - Pokémon Search</h1>

      <form onSubmit={searchPokemon} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter Pokémon name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: "0.5rem",
            width: "250px",
            fontSize: "1rem",
            marginRight: "0.5rem",
          }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>Search</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {pokemon && (
        <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem", borderRadius: "10px" }}>
          <h2>{pokemon.name.toUpperCase()}</h2>
          <img src={pokemon.sprites.front_default} alt={pokemon.name} width="120" />
          <p>Height: {pokemon.height}</p>
          <p>Weight: {pokemon.weight}</p>
          <p>Types: {pokemon.types.map((t) => t.type.name).join(", ")}</p>
          <Link to={`/pokemon/${pokemon.name}`} style={{ marginTop: "0.5rem", display: "inline-block", color: "#3366cc" }}>
            View Full Details →
          </Link>
        </div>
      )}
    </div>
  );
}
