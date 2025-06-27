// src/pages/PokedexTimeline.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PokedexTimeline() {
  const [generations, setGenerations] = useState([]);
  const [pokemonList, setPokemonList] = useState([]);
  const [selectedGen, setSelectedGen] = useState(null);

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/generation/")
      .then((res) => res.json())
      .then((data) => setGenerations(data.results));
  }, []);

  const handleSelectGeneration = async (url, index) => {
    setSelectedGen(index + 1);
    const res = await fetch(url);
    const data = await res.json();
    setPokemonList(data.pokemon_species);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📘 Pokédex Timeline</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        {generations.map((gen, i) => (
          <button
            key={gen.name}
            onClick={() => handleSelectGeneration(gen.url, i)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              backgroundColor: selectedGen === i + 1 ? "#0077b6" : "#e0e0e0",
              color: selectedGen === i + 1 ? "white" : "#333",
              fontWeight: "bold"
            }}
          >
            Gen {i + 1}
          </button>
        ))}
      </div>

      {pokemonList.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {pokemonList
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((p) => (
              <Link
                to={`/pokemon/${p.name}`}
                key={p.name}
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f1faee",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#1d3557"
                }}
              >
                {p.name.toUpperCase()}
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
