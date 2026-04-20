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

  useEffect(() => {
    if (!selectedGeneration) {
      setAllPokemonInGen([]);
      return;
    }
    fetch(selectedGeneration)
      .then((res) => res.json())
      .then((data) => {
        setAllPokemonInGen(data.pokemon_species.sort((a, b) => a.name.localeCompare(b.name)));
      });
  }, [selectedGeneration]);

  useEffect(() => {
    if (!selectedType) {
      setTypeFilteredNames(null);
      return;
    }
    fetch(`https://pokeapi.co/api/v2/type/${selectedType}`)
      .then((res) => res.json())
      .then((data) => setTypeFilteredNames(data.pokemon.map((p) => p.pokemon.name)));
  }, [selectedType]);

  useEffect(() => {
    if (!selectedAbility) {
      setAbilityFilteredNames(null);
      return;
    }
    fetch(`https://pokeapi.co/api/v2/ability/${selectedAbility}`)
      .then((res) => res.json())
      .then((data) => setAbilityFilteredNames(data.pokemon.map((p) => p.pokemon.name)));
  }, [selectedAbility]);

  useEffect(() => {
    if (allPokemonInGen.length === 0) {
      setFilteredPokemon([]);
      return;
    }
    let filtered = allPokemonInGen.map((p) => p.name);
    if (typeFilteredNames) filtered = filtered.filter((n) => typeFilteredNames.includes(n));
    if (abilityFilteredNames) filtered = filtered.filter((n) => abilityFilteredNames.includes(n));
    if (searchTerm) filtered = filtered.filter((n) => n.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredPokemon(filtered.map((n) => allPokemonInGen.find((p) => p.name === n)));
  }, [searchTerm, allPokemonInGen, typeFilteredNames, abilityFilteredNames]);

  const selectClass =
    "px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-pokemon-red shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-center text-4xl font-black text-pokemon-red mb-2">🔍 Pokédex Explorer</h1>
        <p className="text-center text-gray-400 mb-8">Filter by generation, type, and ability</p>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap gap-3 justify-center">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pokemon-red shadow-sm w-52"
            />
            <select
              value={selectedGeneration}
              onChange={(e) => setSelectedGeneration(e.target.value)}
              className={selectClass}
            >
              <option value="">All Generations</option>
              {generations.map((gen) => (
                <option key={gen.name} value={gen.url}>
                  {gen.name.replace("generation-", "Generation ").toUpperCase()}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={selectClass}
            >
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type.name} value={type.name}>
                  {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedAbility}
              onChange={(e) => setSelectedAbility(e.target.value)}
              className={selectClass}
            >
              <option value="">All Abilities</option>
              {abilities.map((ability) => (
                <option key={ability.name} value={ability.name}>
                  {ability.name.charAt(0).toUpperCase() + ability.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        {filteredPokemon.length > 0 && (
          <p className="text-center text-sm text-gray-400 mb-4">
            {filteredPokemon.length} Pokémon found
          </p>
        )}

        {/* Pokemon Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPokemon.length === 0 && selectedGeneration ? (
            <p className="col-span-full text-center text-gray-400 py-12">No Pokémon found.</p>
          ) : !selectedGeneration ? (
            <p className="col-span-full text-center text-gray-400 py-12">
              Select a generation to start exploring!
            </p>
          ) : null}
          {filteredPokemon.map((p) => (
            <Link
              key={p.name}
              to={`/pokemon/${p.name}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
            >
              <img
                src={`https://img.pokemondb.net/sprites/home/normal/${p.name}.png`}
                alt={p.name}
                className="w-20 h-20 mb-2 group-hover:scale-110 transition-transform duration-200"
                loading="lazy"
              />
              <span className="text-pokemon-dark font-bold text-xs text-center tracking-wide">
                {p.name.toUpperCase()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
