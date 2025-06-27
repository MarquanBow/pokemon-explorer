import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PokedexExplorer() {
  const [generations, setGenerations] = useState([]);
  const [types, setTypes] = useState([]);
  const [abilities, setAbilities] = useState([]);

  const [selectedGeneration, setSelectedGeneration] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedAbility, setSelectedAbility] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [allPokemonInGen, setAllPokemonInGen] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);

  const [typeFilteredNames, setTypeFilteredNames] = useState(null);
  const [abilityFilteredNames, setAbilityFilteredNames] = useState(null);

  // Fetch dropdown filter data on mount
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/generation")
      .then((res) => res.json())
      .then((data) => setGenerations(data.results));

    fetch("https://pokeapi.co/api/v2/type")
      .then((res) => res.json())
      .then((data) => setTypes(data.results));

    fetch("https://pokeapi.co/api/v2/ability?limit=150")
      .then((res) => res.json())
      .then((data) => setAbilities(data.results));
  }, []);

  // Fetch Pokémon from selected generation
  useEffect(() => {
    if (!selectedGeneration) {
      setAllPokemonInGen([]);
      return;
    }

    fetch(selectedGeneration)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.pokemon_species.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setAllPokemonInGen(sorted);
      });
  }, [selectedGeneration]);

  // Fetch Pokémon names by type
  useEffect(() => {
    if (!selectedType) {
      setTypeFilteredNames(null);
      return;
    }

    fetch(`https://pokeapi.co/api/v2/type/${selectedType}`)
      .then((res) => res.json())
      .then((data) => {
        const names = data.pokemon.map((p) => p.pokemon.name);
        setTypeFilteredNames(names);
      });
  }, [selectedType]);

  // Fetch Pokémon names by ability
  useEffect(() => {
    if (!selectedAbility) {
      setAbilityFilteredNames(null);
      return;
    }

    fetch(`https://pokeapi.co/api/v2/ability/${selectedAbility}`)
      .then((res) => res.json())
      .then((data) => {
        const names = data.pokemon.map((p) => p.pokemon.name);
        setAbilityFilteredNames(names);
      });
  }, [selectedAbility]);

  // Filtering logic
  useEffect(() => {
    if (allPokemonInGen.length === 0) {
      setFilteredPokemon([]);
      return;
    }

    let filtered = allPokemonInGen.map((p) => p.name);

    if (typeFilteredNames) {
      filtered = filtered.filter((name) => typeFilteredNames.includes(name));
    }

    if (abilityFilteredNames) {
      filtered = filtered.filter((name) => abilityFilteredNames.includes(name));
    }

    if (searchTerm) {
      filtered = filtered.filter((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const finalList = filtered.map((name) =>
      allPokemonInGen.find((p) => p.name === name)
    );

    setFilteredPokemon(finalList);
  }, [searchTerm, allPokemonInGen, typeFilteredNames, abilityFilteredNames]);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center", color: "#ef233c" }}>🔍 Pokédex Explorer</h1>

      {/* Search Input */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search Pokémon by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "300px",
            fontSize: "1rem",
          }}
        />
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        {/* Generation Filter */}
        <select
          value={selectedGeneration}
          onChange={(e) => setSelectedGeneration(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "8px", fontSize: "1rem" }}
        >
          <option value="">Select Generation</option>
          {generations.map((gen) => (
            <option key={gen.name} value={gen.url}>
              {gen.name.replace("generation-", "Generation ")}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "8px", fontSize: "1rem" }}
        >
          <option value="">Select Type</option>
          {types.map((type) => (
            <option key={type.name} value={type.name}>
              {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
            </option>
          ))}
        </select>

        {/* Ability Filter */}
        <select
          value={selectedAbility}
          onChange={(e) => setSelectedAbility(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "8px", fontSize: "1rem" }}
        >
          <option value="">Select Ability</option>
          {abilities.map((ability) => (
            <option key={ability.name} value={ability.name}>
              {ability.name.charAt(0).toUpperCase() + ability.name.slice(1)}
            </option>
          ))}
        </select>

        {/* Region Filter (can be implemented later) */}
        {/* Add here if region-to-Pokémon mapping is needed */}
      </div>

      {/* Pokémon Display Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
          gap: "1rem",
        }}
      >
        {filteredPokemon.length === 0 ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            No Pokémon found.
          </p>
        ) : (
          filteredPokemon.map((p) => (
            <Link
              key={p.name}
              to={`/pokemon/${p.name}`}
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                padding: "1rem",
                textDecoration: "none",
                color: "#023047",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "0.9rem",
              }}
            >
              <img
                src={`https://img.pokemondb.net/sprites/home/normal/${p.name}.png`}
                alt={p.name}
                style={{ width: "80px", marginBottom: "0.5rem" }}
                loading="lazy"
              />
              {p.name.toUpperCase()}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
